import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import crypto from "crypto";
import { Timestamp } from "firebase/firestore";
import notificationService from "@/providers/notification_service";
import { NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handleOrderWebhook(body: any, headers: { [key: string]: string }) {
  try {
    console.log("Received body in order webhook:", body);

    // Extract the signature from headers
    const signature = headers["x-paystack-signature"];
    if (!signature) {
      console.error("Missing Paystack signature");
      return NextResponse.json({ message: "Missing Paystack signature" }, { status: 400 });
    }

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      console.error("Paystack secret key is not configured");
      return NextResponse.json(
        { message: "Paystack secret key is not configured" },
        { status: 500 }
      );
    }

    // Compute the hash
    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(body))
      .digest("hex");

    // Verify the signature
    if (hash !== signature) {
      console.error("Unauthorized signature");
      return NextResponse.json({ message: "Unauthorized" }, { status: 400 });
    }

    const event = body;

    if (event.event === "charge.success") {
      const transactionData = event.data;
      const { metadata, reference, amount } = transactionData;
      const orderId = metadata.orderId;

      console.log("Processing charge.success event for orderId:", orderId);

      // Step 1: Validate metadata
      if (!metadata || !metadata.products || !metadata.storeId || !metadata.clientId || !metadata.customerDetails) {
        console.error("Invalid metadata in webhook payload:", metadata);
        return NextResponse.json({ message: "Invalid metadata" }, { status: 400 });
      }

      const { storeId, clientId, products, customerDetails } = metadata;

      // Step 2: Validate products
      if (!Array.isArray(products)) {
        console.error("Invalid products in metadata:", products);
        return NextResponse.json({ message: "Invalid products" }, { status: 400 });
      }

      // Step 3: Fetch store data
      const storeRef = doc(db, "stores", storeId);
      const storeDoc = await getDoc(storeRef);

      if (!storeDoc.exists()) {
        console.error("Store not found for storeId:", storeId);
        return NextResponse.json({ message: "Store not found" }, { status: 404 });
      }

      const storeData = storeDoc.data();
      const storeOwnerId = storeData.userId;

      // Step 4: Update client (if needed)
      const clientRef = doc(db, "clients", clientId);
      const clientDoc = await getDoc(clientRef);

      if (!clientDoc.exists()) {
        // Create a new client document if it doesn't exist
        await setDoc(clientRef, {
          name: customerDetails.name,
          email: customerDetails.email,
          phone: customerDetails.phone,
          address: customerDetails.address,
          region: customerDetails.region,
          city: customerDetails.city,
          additionalNotes: customerDetails.additionalNotes || "", // Ensure additionalNotes is included
          orderHistory: [], // Initialize empty order history
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date()),
        });
        console.log("New client created:", clientId);
      }

      // Step 5: Create the order for the store
      const orderRef = doc(db, "stores", storeId, "orders", orderId);
      await setDoc(orderRef, {
        order_status: "Pending",
        isPaid: true,
        products: products,
        paymentReference: reference,
        clientId: clientId,
        address: customerDetails.address,
        phone: customerDetails.phone,
        clientName: customerDetails.name,
        amount: amount / 100,
        additionalNotes: customerDetails.additionalNotes || "", // Ensure additionalNotes is included
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      });

      console.log(`Order created for store ${storeId}`);

      // Step 6: Update client's order history
      const clientOrderHistoryRef = doc(db, "clients", clientId, "orders", orderId);
      await setDoc(clientOrderHistoryRef, {
        storeId: storeId,
        products: products.map((product) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: product.qty || 1, // Ensure qty is included
          image: product.image?.[0] || "", // Ensure image is included
        })),
        store: {
          store: storeData.name,
          storeLocation: storeData.location,
          storePhone: storeData.phone,
        },
        isPaid: true,
        order_status: "Pending",
        amount: amount / 100, // Convert back to the original amount
        paymentReference: reference,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      });

      console.log("Order history updated for client:", clientId);

      // Step 7: Notify the client and store owner about the successful order
      await notificationService.notifyOrderSuccess(clientId, storeOwnerId, orderId);

      // Step 8: Update store owner's payment history
      const userRef = doc(db, "users", storeOwnerId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const paymentHistory = userData.paymentHistory || [];

        const updatedPaymentHistory = paymentHistory.map((payment: { storeId: string; amount: number }) => {
          if (payment.storeId === storeId) {
            return {
              ...payment,
              amount: payment.amount + amount / 100, // Update payment amount
              updatedAt: Timestamp.fromDate(new Date()), // Update timestamp
            };
          }
          return payment; // Return unchanged payment entries
        });

        await updateDoc(userRef, {
          paymentHistory: updatedPaymentHistory,
        });

        console.log("Payment history updated for store owner:", storeOwnerId);
      } else {
        console.error("No user data found for store owner with userId:", storeOwnerId);
      }

      // Step 9: Update the store's amount balance
      const currentStoreAmount = parseFloat(storeData.amount || "0");
      const newStoreAmount = currentStoreAmount + amount / 100; // Update store amount

      await updateDoc(storeRef, {
        amount: newStoreAmount.toString(),
        updatedAt: Timestamp.fromDate(new Date()),
      });

      console.log(`Store ${storeId} balance updated`);
    } else if (event.event === "charge.failed") {
      const transactionData = event.data;
      const { metadata } = transactionData;
      const orderId = metadata?.orderId;

      console.log("Processing charge.failed event for orderId:", orderId);

      if (!metadata || !metadata.storeId || !metadata.clientId) {
        console.error("Invalid metadata in webhook payload:", metadata);
        return NextResponse.json({ message: "Invalid metadata" }, { status: 400 });
      }

      const { storeId, clientId } = metadata;

      // Fetch store owner ID
      const storeRef = doc(db, "stores", storeId);
      const storeDoc = await getDoc(storeRef);

      if (!storeDoc.exists()) {
        console.error("Store not found for storeId:", storeId);
        return NextResponse.json({ message: "Store not found" }, { status: 404 });
      }

      const storeData = storeDoc.data();
      const storeOwnerId = storeData.userId;

      // Notify the client and store owner about the failed order
      await notificationService.notifyOrderFailure(clientId, storeOwnerId, orderId);
    }

    console.log("Webhook processing completed.");
    return NextResponse.json({ message: "Order event processed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in order webhook:", error);
    return NextResponse.json({ message: "Error processing webhook" }, { status: 500 });
  }
}