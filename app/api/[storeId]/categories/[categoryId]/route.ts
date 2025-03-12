import { db } from "@/lib/firebase";
import { auth } from "@clerk/nextjs/server";
import { doc, getDoc, updateDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export type paramsType = Promise<{ storeId: string; categoryId: string }>;

export const PATCH = async (
    req: Request,
    { params }: { params: paramsType }
) => {
    try {
        const authResult = await auth();
        const userId = authResult?.userId;

        if (!userId) {
            return new NextResponse("Un-Authorized", { status: 400 });
        }

        const { storeId, categoryId } = await params;

        if (!storeId || !categoryId) {
            return new NextResponse("Store ID or Category ID is missing", { status: 400 });
        }

        const body = await req.json();
        const { name, bannerLabel, bannerId } = body;

        if (!name || !bannerId) {
            return new NextResponse("Category name or Banner ID is missing", { status: 400 });
        }

        // Reference to the global category document
        const categoryRef = doc(db, "categories", categoryId);
        const categorySnap = await getDoc(categoryRef);

        if (!categorySnap.exists()) {
            return new NextResponse("Category Not Found", { status: 404 });
        }

        // Fetch the store document
        const storeRef = doc(db, "stores", storeId);
        const storeSnap = await getDoc(storeRef);

        if (!storeSnap.exists()) {
            return new NextResponse("Store Not Found", { status: 404 });
        }

        const storeData = storeSnap.data();
        if (storeData?.userId !== userId) {
            return new NextResponse("Unauthorized Access", { status: 403 });
        }

        // Update the category in the global "categories" collection
        await updateDoc(categoryRef, {
            name,
            bannerLabel,
            bannerId,
            updatedAt: serverTimestamp(),
        });

        // Fetch the updated category
        const updatedCategory = (await getDoc(categoryRef)).data();

        return NextResponse.json(updatedCategory);
    } catch (error) {
        console.log(`CATEGORIES_PATCH: ${error}`);
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

        if (!userId) {
            return new NextResponse("Un-Authorized", { status: 400 });
        }

        const { storeId, categoryId } = await params;

        if (!storeId || !categoryId) {
            return new NextResponse("Store ID or Category ID is missing", { status: 400 });
        }

        // Reference to the global category document
        const categoryRef = doc(db, "categories", categoryId);
        const categorySnap = await getDoc(categoryRef);

        if (!categorySnap.exists()) {
            return new NextResponse("Category Not Found", { status: 404 });
        }

        // Fetch the store document
        const storeRef = doc(db, "stores", storeId);
        const storeSnap = await getDoc(storeRef);

        if (!storeSnap.exists()) {
            return new NextResponse("Store Not Found", { status: 404 });
        }

        const storeData = storeSnap.data();
        if (storeData?.userId !== userId) {
            return new NextResponse("Unauthorized Access", { status: 403 });
        }

        // Delete the category from the global "categories" collection
        await deleteDoc(categoryRef);

        // Remove category reference from the store document
        const categoryRefs = storeData?.categoryRefs || [];
        const updatedCategoryRefs = categoryRefs.filter((id: string) => id !== categoryId);

        await updateDoc(storeRef, {
            categoryRefs: updatedCategoryRefs,
        });

        return NextResponse.json({ message: "Category Deleted" });
    } catch (error) {
        console.log(`CATEGORIES_DELETE: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};