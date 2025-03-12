import { db } from "@/lib/firebase";
import { Color } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import {  deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export type paramsType = Promise<{ storeId: string; colorId: string }>;

export const PATCH = async (req: Request, 
    {params} : {params : paramsType}
) => {
    try {
        // Ensure auth is awaited if it returns a Promise
        const authResult = await auth();
        const userId = authResult?.userId;

        const body = await req.json();
        const { storeId } = await params;
        const { colorId } = await params;

        if (!userId) {
            return new NextResponse("Un-Authorized", { status: 400 });
        }

        const { name, value } = body;
         
        if (!name) {
            return new NextResponse("Color name is missing", { status: 400 });
        }
        if (!value) {
            return new NextResponse("Color Value is missing", { status: 400 });
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

        const colorRef = await getDoc(
            doc(db, "stores", storeId, "colors", colorId)
        )

        if(colorRef.exists()){
            await updateDoc(
                doc(db, "stores", storeId, "colors", colorId), {
                    ...colorRef.data(),
                    name,
                    value,
                    updatedAt : serverTimestamp(),
                }
            )
        }else {
            return new NextResponse("color Not Found", { status: 404 })
        }

        const color = (
            await getDoc(
                doc(db, "stores", storeId, "colors", colorId)
            )
        ).data() as Color;


        return NextResponse.json(color);
    } catch (error) {
        console.log(`COLOR_PATCH: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}





export const DELETE = async (req: Request, 
    {params} : {params : paramsType}
) => {
    try {
        // Ensure auth is awaited if it returns a Promise
        const authResult = await auth();
        const userId = authResult?.userId;
        const { storeId } = await params;
        const { colorId } = await params;

         

        if (!storeId) {
            return new NextResponse("Store Id not found", { status: 400 });
        }

        if (!colorId) {
            return new NextResponse("Billboard Id not found", { status: 400 });
        }

        const store = await getDoc(doc(db, "stores", storeId));

        if(store.exists()){
            const storeData = store.data()
            if (storeData?.userId !== userId){
                return new NextResponse("Un-Authorized Access", {status: 500});
            }
        }

        const colorRef =
            doc(db, "stores", storeId, "colors", colorId)
        
            await deleteDoc(colorRef);


        return NextResponse.json({msg: "Color Deleted"});
    } catch (error) {
        console.log(`COLOR_DELETE: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}