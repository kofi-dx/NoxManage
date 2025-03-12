import { NextRequest, NextResponse } from "next/server";
import https from 'https';

// Define the expected structure of the Paystack response for payment initialization
interface PaymentInitializationResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const { email, amount, subaccount } = await req.json();

    console.log("Received data:", { email, amount, subaccount });

    // Check if required fields are present
    if (!email || !amount || !subaccount) {
      console.error("Missing required fields");
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Initialize a payment via Paystack API
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/transaction/initialize',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      }
    };

    const params = JSON.stringify({
      email,
      amount,
      subaccount,
    });

    const data: PaymentInitializationResponse = await new Promise((resolve, reject) => {
      const req = https.request(options, res => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve(JSON.parse(data));
        });
      }).on('error', error => {
        reject(error);
      });

      req.write(params);
      req.end();
    });

    console.log("Paystack response:", data);

    if (!data.status) {
      throw new Error(data.message);
    }

    return NextResponse.json({ message: 'Payment initialized successfully', authorization_url: data.data.authorization_url });
  } catch (error) {
    console.error("Error initializing payment:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "An unknown error occurred" }, { status: 500 });
  }
}
