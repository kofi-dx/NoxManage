import { NextRequest, NextResponse } from "next/server";



const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

const planCodes = {
  Free: process.env.NEXT_PUBLIC_PAYSTACK_PRODUCT_33,
  Basic: process.env.NEXT_PUBLIC_PAYSTACK_PRODUCT_73,
  Premium: process.env.NEXT_PUBLIC_PAYSTACK_PRODUCT_183,
};

interface RequestBody {
  plan: keyof typeof planCodes;
  email: string;
}

export async function POST(req: NextRequest) {
  try {
    const { plan, email }: RequestBody = await req.json();

    if (!email || !planCodes[plan]) {
      console.log("Invalid Plan or Email:", { email, plan });
      return NextResponse.json({ message: "Invalid Plan or Email" }, { status: 400 });
    }

    // Determine amount in kobo (e.g., 14900 kobo = 149 GHS)
    const amount = plan === "Free" ? 0 : plan === "Basic" ? 14900 : 26900;

    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, amount, plan: planCodes[plan] }),
    };

    console.log("Sending request to Paystack:", options);
    const response = await fetch("https://api.paystack.co/transaction/initialize", options);
    const data = await response.json();

    if (!response.ok) {
      console.error("Paystack API Error:", data);
      return NextResponse.json(data, { status: response.status });
    }

    // Return Paystack response to frontend
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error initializing payment:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}