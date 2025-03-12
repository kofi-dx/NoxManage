import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { addDoc, collection, doc, serverTimestamp, updateDoc, getDoc } from "firebase/firestore";
import { Order } from "@/types-db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const OPTIONS = async () => {
  return NextResponse.json({}, { headers: corsHeaders });
};
 
export type paramsType = Promise<{ storeId: string; }>;

export const POST = async (req: Request, { params }: { params: paramsType}) => {
  try {
    const { storeId } = await params;
    console.log("Store ID:", storeId);

    const requestBody = await req.json();
    console.log("Request Body:", requestBody);

    const { products, customerDetails } = requestBody;
    const { name, phone, email, address, region, city, additionalNotes } = customerDetails;

    if (!name || !phone || !address || !region || !city) {
      return NextResponse.json({ message: "Required fields are missing" }, { status: 400 });
    }

    const storeRefFromProduct = products[0]?.storeRef;
    if (!storeRefFromProduct) {
      return NextResponse.json({ message: "Store reference missing from product" }, { status: 400 });
    }

    const storeRef = doc(db, "stores", storeRefFromProduct);
    const storeDoc = await getDoc(storeRef);

    if (!storeDoc.exists()) {
      console.log("Store not found for storeRef:", storeRefFromProduct);
      return NextResponse.json({ message: "Store not found" }, { status: 404 });
    }

    const storeData = storeDoc.data();
    const subaccountCode = storeData?.subaccount_code;

    if (!subaccountCode) {
      return NextResponse.json({ message: "Subaccount code not found for this store" }, { status: 400 });
    }

    const orderData: Order = {
      id: "",
      isPaid: false,
      paymentProvider: "paystack",
      phone,
      address,
      region,
      city,
      additionalNotes,
      products: products,
      order_status: "Pending",
      createdAt: serverTimestamp(),
      paymentReference: "",
      storeOwnerId: "",
      amount: "",
      clientName: "",
      clientId: "",
    };

    const orderRef = await addDoc(collection(db, "stores", storeRefFromProduct, "orders"), orderData);
    const orderId = orderRef.id;

    await updateDoc(orderRef, {
      id: orderId,
      updatedAt: serverTimestamp(),
    });

    const totalAmount = products.reduce((total: number, item: { price: number; qty: number }) => total + item.price * item.qty * 100, 0);
    console.log("Total amount:", totalAmount);

    const paymentData = {
      email: email,
      amount: totalAmount,
      metadata: { orderId, storeId },
      subaccount: subaccountCode,
      callback_url: `${process.env.FRONTEND_STORE_URL}/cart?success=1`,
    };

    console.log("Payment data to Paystack:", paymentData);
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
      body: JSON.stringify(paymentData),
    });
    const data = await response.json();
    console.log("Paystack response:", data);

    if (data.status) {
      return NextResponse.json({ authorization_url: data.data.authorization_url }, { headers: corsHeaders });
    } else {
      console.error("Error initializing payment:", data.message);
      return NextResponse.json({ message: "Payment initialization failed", error: data.message }, { status: 500 });
    }
  } catch (error) {
    console.error("Error during checkout:", error);
    return NextResponse.json({ message: "Payment initialization failed", error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
};