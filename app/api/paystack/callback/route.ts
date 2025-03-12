import { NextRequest, NextResponse } from "next/server";
import { handleTransferWebhook } from "./withdraw";
import { handleOrderWebhook } from "./order"; // Handles order payments
import { handleProductWebhook } from "./store"; // Handles product/subscription payments
import { handleStoreWebhook } from "./user"; // Handles store-related payments

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Received body:", body);

    const headers = {
      "x-paystack-signature": req.headers.get("x-paystack-signature") || "",
    };

    // Handle charge.success events
    if (body.event === "charge.success") {
      const metadata = body.data.metadata || {};

      // If metadata contains orderId or clientId, it's an order payment
      if (metadata.orderId || metadata.clientId) {
        console.log("🔹 Processing as an order");
        return handleOrderWebhook(body, headers);
      }

      // If the payload contains a plan, it's a subscription/product payment
      if (body.data.plan && body.data.plan.plan_code) {
        console.log("🔹 Processing as a subscription/product");
        return handleProductWebhook(body, headers);
      }

      // Default to store payment if no specific conditions are met
      console.log("🔹 Processing as a store payment");
      return handleStoreWebhook(body);
    }

    // Handle product events
    if (body.event === "product.success") {
      return handleProductWebhook(body, headers);
    }

    // Handle store events
    if (body.event === "store.success") {
      return handleStoreWebhook(body);
    }

    // Handle withdrawals/transfers
    if (body.event === "transfer.success") {
      return handleTransferWebhook(body, headers);
    }

    console.error("❌ Unknown event type:", body.event);
    return NextResponse.json({ message: "Unknown event type" }, { status: 400 });

  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}