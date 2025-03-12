/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "@/lib/firebase";
import { Size } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { NextResponse } from "next/server";

export type paramsType = Promise<{ storeId: string; sizesId: string }>;

export const POST = async (
  req: Request,
  { params }: { params: paramsType }
) => {
  try {
    const authResult = await auth();
    const userId = authResult?.userId;

    const { sizesId } = await params;

    const body = await req.json();

    if (!userId) {
      return new NextResponse("Un-Authorized", { status: 400 });
    }

    const { name, value } = body;

    if (!name) {
      return new NextResponse("Size name is missing", { status: 400 });
    }
    if (!value) {
      return new NextResponse("Size value is missing", { status: 400 });
    }

    if (!sizesId) {
      return new NextResponse("Sizes ID not found", { status: 400 });
    }

    const sizeData = {
      name,
      value,
      userId,
      createdAt: serverTimestamp(),
    };

    const sizeRef = await addDoc(collection(db, "sizes"), sizeData);

    const id = sizeRef.id;

    await updateDoc(doc(db, "sizes", id), {
      ...sizeData,
      id,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ id, ...sizeData });
  } catch (error) {
    console.log(`SIZES_POST: ${error}`);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const GET = async (
  req: Request,
  { params }: { params: paramsType }
) => {
  try {
    const sizesData = (
      await getDocs(collection(db, "sizes"))
    ).docs.map((doc) => doc.data()) as Size[];

    return NextResponse.json(sizesData);
  } catch (error) {
    console.log(`SIZES_GET: ${error}`);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
