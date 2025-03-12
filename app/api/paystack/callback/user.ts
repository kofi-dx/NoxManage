import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, Timestamp } from "firebase/firestore";
import { NextResponse } from "next/server";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

const planCodes: { [key: string]: string } = {
  Free: "PLN_free",
  Basic: "PLN_phfytznvfdgb4gg",
  Premium: "PLN_bgfnzed9mu0blzw",
};

// Define the expected structure of the webhook body
interface PaystackWebhookBody {
  event: string;
  data: {
    customer: { 
      email: string;
    };
    plan: {
      plan_code: string;
    };
    reference: string;
  };
}

export async function handleStoreWebhook(body: PaystackWebhookBody) {
  try {
    console.log("Received body in store webhook:", body);

    const { email } = body.data.customer; // Paystack email
    const { plan_code } = body.data.plan;
    const reference = body.data.reference;

    if (!email || !plan_code || !reference) {
      console.error("Invalid data:", { email, plan_code, reference });
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    console.log("Valid data:", { email, plan_code, reference });

    // Retry Paystack payment verification
    let verificationData;
    const maxRetries = 3;
    let attempt = 0;
    let success = false;

    while (attempt < maxRetries && !success) {
      const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      });

      verificationData = await verifyResponse.json();
      console.log("Paystack verification data:", verificationData);

      if (verificationData.status && verificationData.data.status === "success") {
        success = true; // Transaction verified successfully
      } else {
        attempt++;
        console.log(`Retrying verification (${attempt}/${maxRetries})...`);
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds before retrying
      }
    }

    if (!success) {
      console.error("Paystack payment verification failed:", verificationData);
      return NextResponse.json({ message: "Payment verification failed" }, { status: 400 });
    }

    // Identify the user's plan and allowed stores
    const plan = (Object.keys(planCodes) as (keyof typeof planCodes)[]).find(
      (key) => planCodes[key] === plan_code
    );

    if (!plan) {
      console.error("Invalid plan code:", plan_code);
      return NextResponse.json({ message: "Invalid plan code" }, { status: 400 });
    }

    const allowedStores = plan === "Basic" ? 3 : plan === "Premium" ? 7 : 1;

    const subscriptionData = {
      subscription: {
        isActive: true,
        allowedStores,
        planId: planCodes[plan],
        price: plan === "Free" ? 0 : plan === "Basic" ? 14900 : 26900,
        renewalDate: Timestamp.fromDate(new Date()),
      },
    };

    // Query Firestore to find the user by email
    const usersRef = collection(db, "users");
    const emailQuery = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(emailQuery);

    if (querySnapshot.empty) {
      console.error("User not found with email:", email);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Update the first matched document
    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id; // Get Firestore document ID (userId)
    const userRef = userDoc.ref;

    // Update the subscription
    await updateDoc(userRef, subscriptionData);

    console.log("Subscription updated successfully for user:", userId);

    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/success`;

    return NextResponse.json({
      message: "Transaction successful!",
      success: true,
      redirectUrl,
    });
  } catch (error) {
    console.error("Error in store webhook:", error);
    return NextResponse.json({ message: "Error processing webhook" }, { status: 500 });
  }
}