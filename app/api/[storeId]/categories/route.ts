import { db } from "@/lib/firebase";
import { auth } from "@clerk/nextjs/server";
import { addDoc, collection, doc, getDoc, updateDoc, serverTimestamp, } from "firebase/firestore";
import { NextResponse } from "next/server";

export type paramsType = Promise<{ storeId: string; categoryId?: string }>;

export const POST = async (req: Request, { params }: { params: paramsType }) => {
    try {
      const { storeId } = await params;
      const authResult = await auth();
      const userId = authResult?.userId;
  
      const body = await req.json();
  
      if (!userId) {
        return new NextResponse("Un-Authorized", { status: 400 });
      }
  
      const { name, bannerLabel, bannerId } = body;
  
      if (!name) {
        return new NextResponse("Category name is missing", { status: 400 });
      }
      if (!bannerId) {
        return new NextResponse("Banner is missing", { status: 400 });
      }
  
      if (!storeId) {
        return new NextResponse("Store Id not found", { status: 400 });
      }
  
      // Fetch store document
      const storeDoc = await getDoc(doc(db, "stores", storeId));
      if (!storeDoc.exists()) {
        return new NextResponse("Store not found", { status: 404 });
      }
  
      const storeData = storeDoc.data();
  
      if (storeData?.userId !== userId) {
        return new NextResponse("Un-Authorized Access", { status: 500 });
      }
  
      // Create the category in the global categories collection
      const categoryData = {
        name,
        bannerId,
        bannerLabel,
        storeRef: storeId,  // Link category to store
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
  
      const categoryRef = await addDoc(collection(db, "categories"), categoryData);  // Global categories
  
      const id = categoryRef.id;
  
      // Now that we have the id, update category with the id field
      await updateDoc(doc(db, "categories", id), {
        id, // Assign the id to the category document
        updatedAt: serverTimestamp()
      });
  
      // Update category reference in the store
      await updateDoc(doc(db, "stores", storeId), {
        categoryRefs: [...storeData.categoryRefs || [], id]  // Add categoryRef to store
      });
  
      return NextResponse.json({ id, ...categoryData });
    } catch (error) {
      console.log(`CATEGORIES_POST: ${error}`);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  };
     

  export const GET = async (req: Request, { params }: { params: paramsType }) => {
    try {
      const { storeId } = await params;
  
      if (!storeId) {
        return new NextResponse("Store Id not found", { status: 400 });
      }
  
      const storeDoc = await getDoc(doc(db, "stores", storeId));
      if (!storeDoc.exists()) {
        return new NextResponse("Store not found", { status: 404 });
      }
  
      const storeData = storeDoc.data();
      const categoryRefs = storeData?.categoryRefs || [];
  
      // Fetch categories based on categoryRefs in the store
      const categoryData = await Promise.all(
        categoryRefs.map(async (categoryId: string) => {
          const categoryDoc = await getDoc(doc(db, "categories", categoryId));
          return categoryDoc.data();
        })
      );
  
      return NextResponse.json(categoryData);
    } catch (error) {
      console.log(`CATEGORIES_GET: ${error}`);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  };
  

