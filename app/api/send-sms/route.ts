import { NextResponse } from "next/server";
import twilio from "twilio";

// Configure Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request: Request) {
  try {
    const { phone, message } = await request.json();

    // Validate the request body
    if (!phone || !message) {
      return NextResponse.json(
        { message: "Phone number and message are required" },
        { status: 400 }
      );
    }

    // Send the SMS using Twilio
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: phone,
    });

    return NextResponse.json(
      { message: "SMS sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to send SMS:", error);
    return NextResponse.json(
      { message: "Failed to send SMS" },
      { status: 500 }
    );
  }
}