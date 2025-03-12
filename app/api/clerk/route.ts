
import { Webhook } from "svix";
import { headers } from "next/headers";
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { User } from "@/types-db";

interface ClerkWebhookData {
  id: string;
  first_name: string;
  last_name: string;
  email_addresses: { email_address: string }[];
  phone_numbers?: { phone_number: string }[];
}

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    console.error("Missing signing secret");
    return new Response("Missing signing secret", { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error("Missing webhook headers", { svixId, svixTimestamp, svixSignature });
    return new Response("Missing headers", { status: 400 });
  }

  const payload = await req.json();
  console.log("Received webhook payload:", payload);
  const body = JSON.stringify(payload);

  const wh = new Webhook(SIGNING_SECRET);

  let event: { data: ClerkWebhookData; type: string };

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as { data: ClerkWebhookData; type: string };
    console.log("Webhook verified successfully:", event);
  } catch (err) {
    console.error("Webhook verification failed", err);
    return new Response("Webhook verification failed", { status: 400 });
  }

  const { type, data } = event;
  console.log("Processing event type:", type);

  if (type === "user.created") {
    const { id, first_name, last_name, email_addresses, phone_numbers } = data;

    const user: User = {
      id,
      first_name,
      last_name,
      phone: phone_numbers?.[0]?.phone_number || "",
      email: email_addresses[0]?.email_address || "",
      status: "pending",
      storeRef: [],
      subscription: {
        isActive: false,
        allowedStores: 0,
        planId: "free",
        price: 0,
        renewalDate: serverTimestamp(),
      },
      billingInfo: {
        name: `${first_name} ${last_name}`,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      identityCard: "",
      tin: "",
    };

    try {
      console.log("Syncing user to Firebase:", user);
      await setDoc(doc(db, "users", id), user);
      console.log("User successfully synced to Firebase");
      return new Response(
        JSON.stringify({
          redirect: user.phone ? "/pending?status=pending" : "/enter-phone",
        }),
        { status: 200 }
      );
    } catch (err) {
      console.error("Error syncing user to Firebase", err);
      return new Response("Error syncing user to Firebase", { status: 500 });
    }
  }

  console.warn("Unhandled event type:", type);
  return new Response("Unhandled event type", { status: 400 });
}
