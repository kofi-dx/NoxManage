import { db } from "@/lib/firebase";
import { auth } from "@clerk/nextjs/server";
import { deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export type paramsType = Promise<{ storeId: string; bannerId: string }>;

export const PATCH = async (
  req: Request,
  { params }: { params: paramsType }
) => {
  try {
    const authResult = await auth();
    const userId = authResult?.userId;

    const { storeId, bannerId } = await params;

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

    const bannerRef = doc(db, "banners", bannerId);
    const banner = await getDoc(bannerRef);

    if (!banner.exists()) {
      return new NextResponse("Banner not found", { status: 404 });
    }

    await updateDoc(bannerRef, {
      label,
      imageUrl,
      isActive: isActive ?? banner.data()?.isActive,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ id: bannerId, ...banner.data() });
  } catch (error) {
    console.error(`BANNER_PATCH: ${error}`);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: paramsType }
) => {
  try {
    const authResult = await auth();
    const userId = authResult?.userId;

    const { storeId, bannerId } = await params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
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

    const bannerRef = doc(db, "banners", bannerId);
    await deleteDoc(bannerRef);

    return NextResponse.json({ message: "Banner deleted" });
  } catch (error) {
    console.error(`BANNER_DELETE: ${error}`);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};