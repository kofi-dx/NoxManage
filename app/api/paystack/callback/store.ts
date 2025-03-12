import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, Timestamp, getDoc } from "firebase/firestore";
import { NextResponse } from "next/server";
import notificationService from "@/providers/notification_service";
import crypto from "crypto";


const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

const planId: { [key: string]: string } = {
  "33 Products Plan": process.env.NEXT_PUBLIC_PAYSTACK_PRODUCT_33 || "",
  "73 Products Plan": process.env.NEXT_PUBLIC_PAYSTACK_PRODUCT_73 || "",
  "183 Products Plan": process.env.NEXT_PUBLIC_PAYSTACK_PRODUCT_183 || "",
};


interface PaystackWebhookBody {
  event: string;
  data: {
    customer: { email: string };
    plan: { plan_code: string };
    reference: string;
    metadata: { storeId: string; referrer?: string };
  };
}


export async function handleProductWebhook(
  body: PaystackWebhookBody,
  headers: { [key: string]: string }
) {
  try {
    console.log("Received body in product webhook:", body);

    const signature = headers["x-paystack-signature"];
    if (!signature) {
      console.error("Missing Paystack signature");
      return NextResponse.json({ message: "Missing Paystack signature" }, { status: 400 });
    }

    if (!PAYSTACK_SECRET_KEY) {
      console.error("Paystack secret key is not configured");
      return NextResponse.json(
        { message: "Paystack secret key is not configured" },
        { status: 500 }
      );
    }

    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(body))
      .digest("hex");

    if (hash !== signature) {
      console.error("Unauthorized signature");
      return NextResponse.json({ message: "Unauthorized" }, { status: 400 });
    }

    // Handle charge.success events
    if (body.event === "charge.success") {
      const { customer, plan, reference, metadata } = body.data;
      const { email } = customer; // Extract email from customer object
      const { plan_code } = plan; // Extract plan_code from plan object
      const { storeId, referrer = "Unknown" } = metadata; // Extract metadata

      if (!email || !plan_code || !reference || !storeId) {
        console.error("Invalid data:", { email, plan_code, reference, storeId });
        return NextResponse.json({ message: "Invalid data" }, { status: 400 });
      }

      console.log("Valid data:", { email, plan_code, reference, storeId, referrer });

      let verificationData;
      const maxRetries = 3;
      let attempt = 0;
      let success = false;

      while (attempt < maxRetries && !success) {
        const verifyResponse = await fetch(
          `https://api.paystack.co/transaction/verify/${reference}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
          }
        );

        verificationData = await verifyResponse.json();
        console.log("Paystack verification data:", verificationData);

        if (verificationData.status && verificationData.data.status === "success") {
          success = true;
          break; // Exit loop on success
        } else {
          attempt++;
          console.log(`Retrying verification (${attempt}/${maxRetries})...`);
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }

      if (!success) {
        console.error("Paystack payment verification failed:", verificationData);

        const storeRef = collection(db, "stores");
        const storeQuery = query(storeRef, where("id", "==", storeId));
        const querySnapshot = await getDocs(storeQuery);

        if (!querySnapshot.empty) {
          const storeDoc = querySnapshot.docs[0];
          const storeData = storeDoc.data();
          const storeOwnerId = storeData.userId;

          await notificationService.notifySubscriptionProductFailure(storeOwnerId);
        }

        return NextResponse.json({ message: "Payment verification failed" }, { status: 400 });
      }

      const planName = Object.keys(planId).find((key) => planId[key] === plan_code);
      if (!planName) {
        console.error("Invalid plan code:", plan_code);
        return NextResponse.json({ message: "Invalid plan code" }, { status: 400 });
      }

      const allowedProductCount =
        planName === "33 Products Plan"
          ? 33
          : planName === "73 Products Plan"
          ? 73
          : planName === "183 Products Plan"
          ? 183
          : 0;

      // Fetch the current store document
      const storeRef = collection(db, "stores");
      const storeQuery = query(storeRef, where("id", "==", storeId));
      const querySnapshot = await getDocs(storeQuery);

      if (querySnapshot.empty) {
        console.error("Store not found for storeId:", storeId);
        return NextResponse.json({ message: "Store not found" }, { status: 404 });
      }

      const storeDoc = querySnapshot.docs[0];
      const storeRefDoc = storeDoc.ref;
      const storeData = storeDoc.data();

      // Get the current allowedProduct value (default to 0 if not set)
      const currentAllowedProduct = storeData.subscription?.allowedProduct || 0;

      // Calculate the new allowedProduct value
      const newAllowedProduct = currentAllowedProduct + allowedProductCount;

      // Prepare the subscription data to update
      const subscriptionData = {
        subscription: {
          isActive: true,
          allowedProduct: newAllowedProduct, // Use the new calculated value
          planId: planId[planName],
          price:
            planName === "33 Products Plan"
              ? 69
              : planName === "73 Products Plan"
              ? 159
              : planName === "183 Products Plan"
              ? 250
              : 0,
          renewalDate: Timestamp.fromDate(new Date()),
        },
      };

      // Update the store document with the new subscription data
      try {
        await updateDoc(storeRefDoc, subscriptionData);
        console.log("Subscription updated successfully for store:", storeDoc.id);

        // Fetch the updated document to verify the changes
        const updatedStoreDoc = await getDoc(storeRefDoc);
        if (updatedStoreDoc.exists()) {
          console.log("Updated store data:", updatedStoreDoc.data());
        } else {
          console.error("Updated store document not found");
        }
      } catch (error) {
        console.error("Failed to update store document:", error);
        throw error;
      }

      const storeOwnerId = storeData.userId;
      await notificationService.notifySubscriptionProductSuccess(storeOwnerId, planName);

      return NextResponse.json({
        message: "Transaction successful!",
        success: true,
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/stores/${storeId}/products`,
      });
    }
  } catch (error) {
    console.error("Error in product webhook:", error);
    return NextResponse.json({ message: "Error processing webhook" }, { status: 500 });
  }
}