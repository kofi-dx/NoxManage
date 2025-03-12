import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(request: Request) {
  try {
    const { email, subject, body } = await request.json();

    // Validate the request body
    if (!email || !subject || !body) {
      return NextResponse.json(
        { message: "Email, subject, and body are required" },
        { status: 400 }
      );
    }

    // Send the email using SendGrid
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL!, // Replace with your verified sender email
      subject: subject,
      text: body,
      html: `<p>${body}</p>`,
    };

    await sgMail.send(msg);

    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to send email:", error);
    return NextResponse.json(
      { message: "Failed to send email" },
      { status: 500 }
    );
  }
}