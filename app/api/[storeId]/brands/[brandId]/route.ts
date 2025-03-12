import { db } from "@/lib/firebase";
import { Brand } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import {  deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export type paramsType = Promise<{ storeId: string; brandId: string }>;

export const PATCH = async (req: Request, 
    {params} : {params : paramsType}
) => {
    try {
        // Ensure auth is awaited if it returns a Promise
        const authResult = await auth();
        const userId = authResult?.userId;

        const body = await req.json();
        const { brandId } = await params;
        const { storeId } = await params;

        if (!userId) {
            return new NextResponse("Un-Authorized", { status: 400 });
        }

        const { name, value } = body;
         
        if (!name) {
            return new NextResponse("brand name is missing", { status: 400 });
        }
        if (!value) {
            return new NextResponse("brand Value is missing", { status: 400 });
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

        const brandRef = await getDoc(
            doc(db, "stores", storeId, "brands", brandId)
        )

        if(brandRef.exists()){
            await updateDoc(
                doc(db, "stores", storeId, "brands", brandId), {
                    ...brandRef.data(),
                    name,
                    value,
                    updatedAt : serverTimestamp(),
                }
            )
        }else {
            return new NextResponse("Brand Not Found", { status: 404 })
        }

        const brand = (
            await getDoc(
                doc(db, "stores", storeId, "brands", brandId)
            )
        ).data() as Brand;


        return NextResponse.json(brand);
    } catch (error) {
        console.log(`BRANDS_PATCH: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}


export const DELETE = async (req: Request, 
    {params} : {params : paramsType }
) => {
    try {
        // Ensure auth is awaited if it returns a Promise
        const authResult = await auth();
        const userId = authResult?.userId;
        const { brandId } = await params;
        const { storeId } = await params;

         

        if (!storeId) {
            return new NextResponse("Store Id not found", { status: 400 });
        }

        if (!(await params).brandId) {
            return new NextResponse("Billboard Id not found", { status: 400 });
        }

        const store = await getDoc(doc(db, "stores", storeId));

        if(store.exists()){
            const storeData = store.data()
            if (storeData?.userId !== userId){
                return new NextResponse("Un-Authorized Access", {status: 500});
            }
        }

        const brandRef =
            doc(db, "stores", storeId, "brands", brandId)
        
            await deleteDoc(brandRef);


        return NextResponse.json({msg: "Brand Deleted"});
    } catch (error) {
        console.log(`BRANDS_DELETE: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}