import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, collection, addDoc, Timestamp } from "firebase/firestore";
import notificationService from "@/providers/notification_service";
import crypto from "crypto";

interface PaystackWebhookBody {
  event: string;
  data: {
    id: number;
    amount: number;
    reference: string;
    recipient?: {
      metadata?: {
        userId?: string;
        storeId?: string;
        momoProvider?: string;
        momoNumber?: string;
        firstName?: string;
        lastName?: string;
      };
    };
  };
}


export async function handleTransferWebhook(body: PaystackWebhookBody, headers: { [key: string]: string }) {
  try {
    console.log("✅ Paystack Event Received:", JSON.stringify(body, null, 2));

    // Verify the webhook signature
    const signature = headers["x-paystack-signature"];
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
      console.error("❌ Paystack secret key is not configured");
      return NextResponse.json({ error: "Paystack secret key is not configured" }, { status: 500 });
    }

    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(body))
      .digest("hex");

    if (hash !== signature) {
      console.error("❌ Unauthorized signature");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (body.event === "transfer.success") {
      const { id: transactionId, amount, reference, recipient } = body.data;
      const metadata = recipient?.metadata;

      if (!metadata) {
        console.error("❌ Metadata is missing for recipient:", recipient);
        return NextResponse.json({ error: "Metadata is missing" }, { status: 400 });
      }

      console.log("🔍 Metadata Check:", metadata);

      const { userId, storeId, momoProvider, momoNumber, firstName, lastName } = metadata;
      if (!userId || !storeId || !momoProvider || !momoNumber) {
        console.error("❌ Missing metadata fields. Reference:", reference);
        return NextResponse.json({ error: "Metadata missing required fields" }, { status: 400 });
      }

      const transactionExists = await getDoc(doc(db, `stores/${storeId}/transactions/${transactionId}`));
      if (transactionExists.exists()) {
        console.log("🚫 Duplicate transaction detected:", transactionId);
        return NextResponse.json({ status: "Duplicate transaction" }, { status: 200 });
      }

      const [userSnap, storeSnap] = await Promise.all([
        getDoc(doc(db, "users", userId)),
        getDoc(doc(db, "stores", storeId)),
      ]);

      if (!userSnap.exists() || !storeSnap.exists()) {
        console.error("🚫 User or Store Not Found", { userId, storeId });
        return NextResponse.json({ error: "User or Store not found" }, { status: 404 });
      }

      const userData = userSnap.data();
      const storeData = storeSnap.data();
      const storeBalance = parseFloat(storeData.amount);
      const requestedAmount = amount / 100;
      const tax = requestedAmount * 0.06;
      const totalDeduction = requestedAmount + tax;

      if (storeBalance < totalDeduction) {
        const failedWithdraw = {
          userId,
          storeId,
          amount: requestedAmount,
          tax: tax.toFixed(2),
          momoProvider,
          momoNumber,
          reference: transactionId,
          recipient: {
            name: `${firstName} ${lastName}`,
            account_number: momoNumber,
            bank_code: momoProvider,
          },
          paymentMethod: "mobile_money",
          status: "failed",
          reason: "Insufficient store balance",
          createdAt: Timestamp.now(),
        };
        await addDoc(collection(db, `stores/${storeId}/withdrawals`), failedWithdraw);
        return NextResponse.json({ error: "Insufficient store balance" }, { status: 400 });
      }

      const newStoreAmount = storeBalance - totalDeduction;
      await updateDoc(doc(db, "stores", storeId), { amount: newStoreAmount.toFixed(2) });

      // Record the withdrawal in Firestore
      const withdrawalRecord = {
        userId,
        storeId,
        amount: requestedAmount,
        tax: tax.toFixed(2),
        momoProvider,
        momoNumber,
        status: "completed",
        reference: transactionId,
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, `stores/${storeId}/withdrawals`), withdrawalRecord);

      // Update user's payment history
      const latestPayment = userData.paymentHistory?.[0];
      if (latestPayment) {
        latestPayment.amount -= totalDeduction;
      }
      await updateDoc(doc(db, "users", userId), {
        paymentHistory: [latestPayment, ...userData.paymentHistory.slice(1)],
      });

      // Notify the store owner about the transaction
      await notificationService.notifyTransactionSuccess(storeData.userId, requestedAmount);

      console.log(`💰 Transfer ${reference} Processed Successfully`);
    }

    return NextResponse.json({ status: "Processed" }, { status: 200 });
  } catch (error) {
    console.error("❌ Critical Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}