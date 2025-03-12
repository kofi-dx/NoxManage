import { db } from "@/lib/firebase";
import { Offer } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { NextResponse } from "next/server";

export type paramsType = Promise<{ storeId: string; offerId: string }>;

export const POST = async (
  req: Request,
  { params }: { params: paramsType }
) => {
  try {
    const authResult = await auth();
    const userId = authResult?.userId;
    const body = await req.json();
    const { storeId } = await params;

    if (!userId) {
      return new NextResponse("Un-Authorized", { status: 400 });
    }

    const { title, discountPercentage, startDate, endDate, products } = body;

    // Validate required fields
    if (!title) return new NextResponse("Offer title is required", { status: 400 });
    if (!discountPercentage)
      return new NextResponse("Discount percentage is required", { status: 400 });
    if (!startDate) return new NextResponse("Start date is required", { status: 400 });
    if (!endDate) return new NextResponse("End date is required", { status: 400 });
    if (!products || !products.length)
      return new NextResponse("At least one product is required", { status: 400 });
    if (!storeId) return new NextResponse("Store Id not found", { status: 400 });

    // Check if the store exists and validate user access
    const store = await getDoc(doc(db, "stores", storeId));
    if (!store.exists()) {
      return new NextResponse("Store not found", { status: 404 });
    }

    const storeData = store.data();
    if (storeData?.userId !== userId) {
      return new NextResponse("Un-Authorized Access", { status: 500 });
    }

    // Create the new offer without the `id` field
    const offerData: Omit<Offer, "id"> = {
      title,
      discountPercentage,
      startDate: serverTimestamp(),
      endDate: serverTimestamp(),
      products,
      createdAt: serverTimestamp(),
      isActive: false,
      description: "",
      storeId: storeId
    };

    const offerRef = await addDoc(
      collection(db, "stores", storeId, "offers"),
      offerData
    );
    const offerId = offerRef.id;

    // Update the offer document with its ID
    await updateDoc(offerRef, { id: offerId, updatedAt: serverTimestamp() });

    // Update product fields (newPrice, discountPercentage, isActive)
    await Promise.all(
      products.map(async (productId: string) => {
        const productRef = doc(db, "stores", storeId, "products", productId);
        const productDoc = await getDoc(productRef);

        if (productDoc.exists()) {
          const originalPrice = productDoc.data()?.price || 0;
          const newPrice = originalPrice - (originalPrice * discountPercentage) / 100;

          await updateDoc(productRef, {
            newPrice,
            discountPercentage,
            isActive: true, // Activate the offer for these products
            updatedAt: serverTimestamp(),
          });
        }
      })
    );

    return NextResponse.json({ id: offerId, ...offerData });
  } catch (error) {
    console.error(`OFFERS_POST: ${error}`);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
