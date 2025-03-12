import { NextRequest, NextResponse } from "next/server";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

const planCodes = {
  "33 Products Plan": process.env.NEXT_PUBLIC_PAYSTACK_PRODUCT_33 || "",
  "73 Products Plan": process.env.NEXT_PUBLIC_PAYSTACK_PRODUCT_73 || "",
  "183 Products Plan": process.env.NEXT_PUBLIC_PAYSTACK_PRODUCT_183 || "",
};

interface RequestBody {
  plan: string;
  email: string;
  storeId: string;
}

export type paramsType = Promise<{ storeId: string }>;

export async function POST(req: NextRequest, { params }: { params: paramsType }) {
  try {
    const { storeId } = await params;
    const { plan, email }: RequestBody = await req.json();

    if (!email || !(plan in planCodes)) {
      return NextResponse.json(
        { message: "Invalid Plan or Email" },
        { status: 400 }
      );
    }

    const planCode = planCodes[plan as keyof typeof planCodes];
    if (!planCode) {
      return NextResponse.json(
        { message: "Plan code not configured" },
        { status: 500 }
      );
    }

    const amount =
      plan === "33 Products Plan"
        ? 6900
        : plan === "73 Products Plan"
        ? 15900
        : plan === "183 Products Plan"
        ? 25000
        : 0;

    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount,
        plan: planCode,
        metadata: {
          storeId,
        },
      }),
    };

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      options
    );
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error initializing payment:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}