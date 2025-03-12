import { db } from "@/lib/firebase";
import { Offer } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { NextResponse } from "next/server";

export type paramsType = Promise<{ storeId: string; offerId: string }>;

export const PATCH = async (
  req: Request,
  context: { params: paramsType }
) => {
  try {
    console.log("PATCH Request Received");

    const authResult = await auth();
    const userId = authResult?.userId;

    if (!userId) {
      console.log("PATCH: Missing or invalid userId");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { params } = context;
    if (!params) {
      console.error("PATCH: Missing params object in context");
      return new NextResponse("Internal Server Error: Missing Params", { status: 500 });
    }

    const { storeId, offerId } = await params;
    console.log("PATCH Params:", { storeId, offerId });

    if (!storeId || !offerId) {
      console.error("PATCH: Missing storeId or offerId");
      return new NextResponse("Missing storeId or offerId", { status: 400 });
    }

    const body = await req.json();
    console.log("PATCH Request Body:", body);

    const { title, description, discountPercentage, startDate, endDate, products } = body;

    // Additional validation and error handling
    if (!title || !description || !discountPercentage || !startDate || !endDate || !products?.length) {
      console.error("PATCH: Missing required fields", {
        title,
        description,
        discountPercentage,
        startDate,
        endDate,
        products,
      });
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const store = await getDoc(doc(db, "stores", storeId));
    if (!store.exists()) {
      console.error("PATCH: Store not found");
      return new NextResponse("Store not found", { status: 404 });
    }

    console.log("PATCH: Store found, verifying ownership...");
    const storeData = store.data();
    if (storeData?.userId !== userId) {
      console.error("PATCH: Unauthorized access attempt", { userId, storeOwner: storeData?.userId });
      return new NextResponse("Unauthorized Access", { status: 403 });
    }

    const offerRef = doc(db, "stores", storeId, "offers", offerId);
    const offerDoc = await getDoc(offerRef);
    if (!offerDoc.exists()) {
      console.error("PATCH: Offer not found");
      return new NextResponse("Offer not found", { status: 404 });
    }

    console.log("PATCH: Offer exists. Proceeding with update...");
    await updateDoc(offerRef, {
      title,
      description,
      discountPercentage,
      startDate,
      endDate,
      updatedAt: serverTimestamp(),
    });

    console.log("PATCH: Offer updated successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};


export const DELETE = async (req: Request, { params }: { params: paramsType}) => {
  try {
    const authResult = await auth();
    const userId = authResult?.userId;
    const { storeId, offerId } = await params;

    if (!storeId || !offerId) {
      return new NextResponse("Store Id or Offer Id not found", { status: 400 });
    }

    const store = await getDoc(doc(db, "stores", storeId));
    if (store.exists()) {
      const storeData = store.data();
      if (storeData?.userId !== userId) {
        return new NextResponse("Un-Authorized Access", { status: 500 });
      }
    }

    const offerRef = doc(db, "stores", storeId, "offers", offerId);
    const offerDoc = await getDoc(offerRef);
    if (!offerDoc.exists()) {
      return new NextResponse("Offer Not Found", { status: 404 });
    }

    // Get associated products from the offer
    const offerData = offerDoc.data() as Offer;
    const associatedProducts = offerData.products;

    // Deactivate associated products
    await Promise.all(
      associatedProducts.map(async (productId: string) => {
        const productRef = doc(db, "stores", storeId, "products", productId);
        await updateDoc(productRef, {
          newPrice: 0,
          discountPercentage: 0,
          isActive: false,
          updatedAt: serverTimestamp(),
        });
      })
    );

    await deleteDoc(offerRef);
    return NextResponse.json({ msg: "Offer and associated product updates successful" });
  } catch (error) {
    console.log(`OFFERS_DELETE: ${error}`);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

// ... (rest of the code for GET)