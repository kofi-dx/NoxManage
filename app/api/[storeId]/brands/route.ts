import { db } from "@/lib/firebase";
import {  Brand } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import { addDoc, collection, doc, getDoc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export type paramsType = Promise<{ storeId: string; brandId?: string }>;


export const POST = async (req: Request, 
    {params} : {params: paramsType }
) => {
    try {
        // Ensure auth is awaited if it returns a Promise
        const authResult = await auth();
        const userId = authResult?.userId;
 
        const body = await req.json();
        const { storeId } = await params;

        if (!userId) {
            return new NextResponse("Un-Authorized", { status: 400 });
        }

        const { name, value } = body;
         
        if (!name) {
            return new NextResponse("Brand name is missing", { status: 400 });
        }
        if (!value) {
            return new NextResponse("Brand Value is missing", { status: 400 });
        }

        if (!storeId) {
            return new NextResponse("Store Id not found", { status: 400 });
        }

        const store = await getDoc(doc(db, "stores", storeId));

        if(store.exists()){
            const storeData = store.data()
            if (storeData?.userId !== userId){
                return new NextResponse("Un-Authorized Access", {status: 500});
            }
        }


        const brandData = {
            name,
            value,
            createdAt : serverTimestamp()
        }

        const brandRef = await addDoc(
            collection(db, "stores", storeId, "brands"), brandData
        );

        const id = brandRef.id;

        await updateDoc(doc(db, "stores", storeId, "brands", id), {
            ...brandData,
            id,
            updatedAt : serverTimestamp()
        });

        return NextResponse.json({id, ...brandData});
    } catch (error) {
        console.log(`BRAND_POST: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}


export const GET = async (
    req: Request, 
    {params} : {params : paramsType}
) => {
    try {
        const { storeId } = await params;

        if (!storeId) {
            return new NextResponse("Store Id not found", { status: 400 });
        }

        const brandData = ( await getDocs(
                collection(doc(db, "stores", storeId), "brands")
            )
        ).docs.map(doc => doc.data()) as Brand[];


        return NextResponse.json(brandData)
    } catch (error) {
        console.log(`BRANDS_GET: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}