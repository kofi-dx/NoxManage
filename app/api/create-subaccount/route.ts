
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, arrayUnion, Timestamp, collection } from "firebase/firestore";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const {
      paymentMethod,
      bankCode,
      accountNumber,
      momoNumber,
      momoProvider,
      businessName,
      vendorEmail,
      userId,
      storeId,
    } = await req.json();

    console.log("Received data:", {
      paymentMethod,
      bankCode,
      accountNumber,
      momoNumber,
      momoProvider,
      businessName,
      vendorEmail,
      userId,
      storeId,
    });

    // Check if required fields are missing
    if (!userId || !storeId) {
      console.log("Missing userId or storeId.");
      return NextResponse.json({ error: "User ID and Store ID are required." }, { status: 400 });
    }

    // Fetch user data
    console.log("Fetching user data from Firestore...");
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      console.log("User not found.");
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const userData = userDoc.data();
    console.log("User data fetched:", userData);

    // Fetch store data
    console.log("Fetching store data from Firestore...");
    const storeRef = doc(db, "stores", storeId);
    const storeDoc = await getDoc(storeRef);
    if (!storeDoc.exists()) {
      console.log("Store not found.");
      return NextResponse.json({ error: "Store not found." }, { status: 404 });
    }

    const storeData = storeDoc.data();
    console.log("Store data fetched:", storeData);

    // Ensure all required fields are provided
    if (!paymentMethod || !businessName || !vendorEmail) {
      console.log("Missing required fields: paymentMethod, businessName, or vendorEmail.");
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    let accountDetails;
    if (paymentMethod === "bank") {
      if (!bankCode || !accountNumber) {
        console.log("Missing bank details.");
        return NextResponse.json({ error: "Bank details are required." }, { status: 400 });
      }
      accountDetails = { account_number: accountNumber, bank_code: bankCode };
    } else if (paymentMethod === "momo") {
      if (!momoNumber || !momoProvider) {
        console.log("Missing MoMo details.");
        return NextResponse.json({ error: "MoMo details are required." }, { status: 400 });
      }
      accountDetails = { account_number: momoNumber, bank_code: momoProvider };
    } else {
      console.log("Invalid payment method:", paymentMethod);
      return NextResponse.json({ error: "Invalid payment method." }, { status: 400 });
    }

    // Create subaccount on Paystack
    console.log("Creating Paystack subaccount...");
    const paystackResponse = await axios.post(
      "https://api.paystack.co/subaccount",
      {
        business_name: businessName,
        ...accountDetails,
        percentage_charge: 10,
        primary_contact_email: vendorEmail,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );


    const subaccountCode = paystackResponse.data.data.subaccount_code;
    

    // Generate payment ID
    const paymentRef = doc(collection(db, "payments"));
    const paymentData = {
      id: paymentRef.id,
      userId,
      storeId,
      paymentMethod,
      paymentProvider: "paystack",
      amount: 0, // Adjust the amount as needed
      status: "completed", // Assuming success, you can adjust based on status
      transactionId: subaccountCode, // Using the subaccount code as the transaction ID
      paymentDetails: paymentMethod === "momo"
        ? { momoNumber, momoProvider }
        : { bankCode, accountNumber },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    console.log("Payment data to be saved:", paymentData);

    // Add payment data to Firestore under the user paymentHistory
    console.log("Updating user document with payment history...");
    await updateDoc(userRef, {
      paymentHistory: arrayUnion(paymentData),
      billingInfo: {
        name: businessName,
        subAccountCode: subaccountCode,
        paymentProvider: "paystack",
      },
    });

    // Update store's subaccount_code
    console.log("Updating store document with subaccount code...");
    await updateDoc(storeRef, { subaccount_code: subaccountCode });

    return NextResponse.json({
      message: "Subaccount created and payment history updated.",
      data: paymentData,
    });
  } catch (error) {
    console.error("Error creating subaccount:", error);
    return NextResponse.json({ error: "Failed to create subaccount." }, { status: 500 });
  }
}
