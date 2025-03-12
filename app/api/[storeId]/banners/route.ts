import { db } from "@/lib/firebase";
import { Banner } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { NextResponse } from "next/server";

export type paramsType = Promise<{ storeId: string }>;

export const POST = async (
  req: Request,
  { params }: { params: paramsType }
) => {
  try {
    const authResult = await auth();
    const userId = authResult?.userId;

    const { storeId } = await params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { label, imageUrl, isActive } = body;

    if (!label || !imageUrl) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const storeRef = doc(db, "stores", storeId);
    const store = await getDoc(storeRef);

    if (!store.exists()) {
      return new NextResponse("Store does not exist", { status: 404 });
    }

    const storeData = store.data();
    if (storeData?.userId !== userId) {
      return new NextResponse("Unauthorized Access", { status: 403 });
    }

    const bannerData = {
      label,
      imageUrl,
      isActive: isActive ?? true,
      storeId,
      createdAt: serverTimestamp(),
    };

    const bannerRef = await addDoc(collection(db, "banners"), bannerData);

    const id = bannerRef.id;

    await updateDoc(doc(db, "banners", id), {
      ...bannerData,
      id,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ id, ...bannerData });
  } catch (error) {
    console.error(`BANNER_POST: ${error}`);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const GET = async (
  req: Request,
  { params }: { params: paramsType }
) => {
  try {
    const { storeId } = await params;

    if (!storeId) {
      return new NextResponse("Store ID not found", { status: 404 });
    }

    const bannersRef = collection(db, "banners");
    const bannersQuery = query(bannersRef, where("storeId", "==", storeId));
    const bannersSnapshot = await getDocs(bannersQuery);

    const banners = bannersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Banner[];

    return NextResponse.json(banners);
  } catch (error) {
    console.error(`BANNER_GET: ${error}`);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};