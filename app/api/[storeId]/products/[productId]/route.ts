import { db, storage } from "@/lib/firebase";
import { Product } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import { deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { NextResponse } from "next/server";

export type paramsType = Promise<{ storeId: string; productId: string }>;

export const PATCH = async (req: Request, { params }: { params: paramsType }) => {
  try {
    const authResult = await auth();
    const userId = authResult?.userId;
    const body = await req.json();
    const { storeId, productId } = await params;

    if (!userId) {
      return new NextResponse("Un-Authorized", { status: 400 });
    }

    // Validation for required fields
    const { name, price, descriptions, images, isFeatured, isArchived, category, size, brand, color, type } = body;
    if (!name || !descriptions || !images?.length || !category || !price || !type || !size) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const store = await getDoc(doc(db, "stores", storeId));
    if (store.exists()) {
      const storeData = store.data();
      if (storeData?.userId !== userId) {
        return new NextResponse("Un-Authorized Access", { status: 500 });
      }
    }

    const productRef = doc(db, "stores", storeId, "products", productId);
    const productDoc = await getDoc(productRef);
    if (!productDoc.exists()) {
      return new NextResponse("Product Not Found", { status: 404 });
    }

    // Update the product document
    await updateDoc(productRef, {
      name,
      price,
      descriptions,
      images,
      isFeatured,
      isArchived,
      category,
      size,
      brand,
      color,
      type,
      updatedAt: serverTimestamp(),
    });

    const updatedProduct = (await getDoc(productRef)).data() as Product;
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.log(`PRODUCTS_PATCH: ${error}`);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const DELETE = async (req: Request, { params }: { params: paramsType }) => {
  try {
    const authResult = await auth();
    const userId = authResult?.userId;
    const { storeId, productId } = await params;

    if (!storeId || !productId) {
      return new NextResponse("Store Id or Product Id not found", { status: 400 });
    }

    const store = await getDoc(doc(db, "stores", storeId));
    if (store.exists()) {
      const storeData = store.data();
      if (storeData?.userId !== userId) {
        return new NextResponse("Un-Authorized Access", { status: 500 });
      }
    }

    const productRef = doc(db, "stores", storeId, "products", productId);
    const productDoc = await getDoc(productRef);
    if (!productDoc.exists()) {
      return new NextResponse("Product Not Found", { status: 404 });
    }

    // Delete all the images from the storage
    const images = productDoc.data()?.images;
    if (images && Array.isArray(images)) {
      await Promise.all(images.map(async (image) => {
        const imageRef = ref(storage, image.url);
        await deleteObject(imageRef);
      }));
    }

    await deleteDoc(productRef);
    return NextResponse.json({ msg: "Product & associated images delete successful" });
  } catch (error) {
    console.log(`PRODUCTS_DELETE: ${error}`);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const GET = async (req: Request, { params }: { params: paramsType }) => {
  try {
    const { storeId, productId } = await params;

    if (!storeId || !productId) {
      return new NextResponse("Store Id or Product Id not found", { status: 400 });
    }

    const product = (await getDoc(doc(db, "stores", storeId, "products", productId))).data() as Product;
    return NextResponse.json(product);
  } catch (error) {
    console.log(`PRODUCTS_GET: ${error}`);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};