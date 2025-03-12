/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "@/lib/firebase";
import {  Color } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import { addDoc, collection, doc, getDoc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export type paramsType = Promise<{ storeId: string; colorId: string }>;

export const POST = async (req: Request, 
    {params} : {params : paramsType}
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


        const colorData = {
            name,
            value,
            createdAt : serverTimestamp()
        }

        const colorRef = await addDoc(
            collection(db, "stores", storeId, "colors"), colorData
        );

        const id = colorRef.id;

        await updateDoc(doc(db, "stores", storeId, "colors", id), {
            ...colorData,
            id,
            updatedAt : serverTimestamp()
        });

        return NextResponse.json({id, ...colorData});
    } catch (error) {
        console.log(`COLOR_POST: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}


export const GET = async (
  req: Request,
  { params }: { params: paramsType }
) => {
  try {
    const colorsData = (
      await getDocs(collection(db, "colors"))
    ).docs.map((doc) => doc.data()) as Color[];

    return NextResponse.json(colorsData);
  } catch (error) {
    console.log(`COLORS_GET: ${error}`);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};