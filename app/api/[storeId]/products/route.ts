/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/firebase";
import { Product } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  query,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { NextResponse } from "next/server";

// Utility function to check if a value is a Timestamp
const isTimestamp = (value: any): value is Timestamp => {
  return value instanceof Timestamp;
};

export type paramsType = Promise<{ storeId: string }>;

export const POST = async (
  req: Request,
  { params }: { params: paramsType }
) => {
  try {
    const authResult = await auth();
    const userId = authResult?.userId;
    const body = await req.json();
    const { storeId } = await params;

    console.log("Store ID:", storeId); // Debug log
    console.log("Request Body:", body); // Debug log

    if (!userId) {
      return new NextResponse("Un-Authorized", { status: 400 });
    }

    const {
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
      condition, // Include condition in destructuring
    } = body;

    // Validate required fields
    if (!name) return new NextResponse("Product name is required", { status: 400 });
    if (!descriptions) return new NextResponse("Product description is required", { status: 400 });
    if (!images || !images.length)
      return new NextResponse("Images are required", { status: 400 });
    if (!category) return new NextResponse("Category is required", { status: 400 });
    if (!price) return new NextResponse("Price is required", { status: 400 });
    if (!condition)
      return new NextResponse("Product condition is required", { status: 400 });

    // Check if the store exists and validate user access
    const store = await getDoc(doc(db, "stores", storeId));
    if (!store.exists()) {
      console.error("Store not found in Firestore");
      return new NextResponse("Store not found", { status: 404 });
    }

    const storeData = store.data();
    if (storeData?.userId !== userId) {
      console.error("Unauthorized access to store");
      return new NextResponse("Un-Authorized Access", { status: 403 });
    }

    // Fetch user data for subAccountCode
    const userDoc = await getDoc(doc(db, "users", userId));
    const userData = userDoc.data();
    const subAccountCode = userData?.billingInfo?.subAccountCode;

    // Create product data
    const productData: Product = {
      storeRef: storeId,
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
      condition,
      subAccountCode,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      newPrice: 0,
      discountPercentage: 0,
      qty: 0,
      id: "",
      isActive: false,
    };

    // Add product to Firestore
    const productRef = await addDoc(collection(db, "products"), productData);
    const productId = productRef.id;

    // Update the product with its ID
    await updateDoc(productRef, { id: productId, updatedAt: serverTimestamp() });

    // Update the store with product reference
    await updateDoc(doc(db, "stores", storeId), {
      productRefs: arrayUnion(productId),
      updatedAt: serverTimestamp(),
    });

    // Return the created product data
    return NextResponse.json({
      ...productData,
      id: productId,
      createdAt: isTimestamp(productData.createdAt)
        ? productData.createdAt.toDate().toISOString()
        : null,
      updatedAt: isTimestamp(productData.updatedAt)
        ? productData.updatedAt.toDate().toISOString()
        : null,
    });
  } catch (error) {
    console.error(`PRODUCTS_POST: ${error}`);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const GET = async (
  req: Request,
  { params }: { params: paramsType }
) => {
  try {
    const { storeId } = await params;

    console.log("Fetching products for store ID:", storeId); // Debug log

    if (!storeId) {
      return new NextResponse("Store ID not found", { status: 400 });
    }

    // Query for global products
    const productQuery = query(collection(db, "products"));
    const querySnapshot = await getDocs(productQuery);

    const products = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate().toISOString() || null,
        updatedAt: data.updatedAt?.toDate().toISOString() || null,
      };
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error(`PRODUCTS_GET: ${error}`);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};