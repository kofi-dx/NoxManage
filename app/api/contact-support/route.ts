import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";
import twilio from "twilio";

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// Configure Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    // Validate the request body
    if (!name || !email || !message) {
      return NextResponse.json(
        { message: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    // Send an email using SendGrid
    const emailMsg = {
      to: process.env.SENDGRID_FROM_EMAIL!, // Your email address
      from: process.env.SENDGRID_FROM_EMAIL!, // Verified sender email
      subject: `New Support Request from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Message: ${message}
      `,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    };

    await sgMail.send(emailMsg);

    // Send an SMS notification using Twilio
    const smsMessage = `New support request from ${name} (${email}): ${message}`;
    await twilioClient.messages.create({
      body: smsMessage,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: process.env.TWILIO_PHONE_NUMBER!, // Your phone number
    });

    return NextResponse.json(
      { message: "Message sent successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to send message:", error);
    return NextResponse.json(
      { message: "Failed to send message" },
      { status: 500 }
    );
  }
}