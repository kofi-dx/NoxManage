import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, Timestamp, getDoc, doc } from "firebase/firestore";

export type paramsType = Promise<{ storeId: string }>;

export async function POST(req: Request, { params }: { params: paramsType }) {
  try {
    const { storeId } = await params;

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID is required" },
        { status: 400 }
      );
    }

    const storeDoc = await getDoc(doc(db, "stores", storeId));
    if (!storeDoc.exists()) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    const storeData = storeDoc.data();
    const storeBalance = parseFloat(storeData.amount || "0");
    const withdrawalLimit = storeBalance * 0.6;

    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const withdrawalsQuery = query(
      collection(db, `stores/${storeId}/withdrawals`),
      where("createdAt", ">=", Timestamp.fromDate(last24Hours))
    );

    const withdrawalsSnapshot = await getDocs(withdrawalsQuery);
    let totalWithdrawnToday = 0;

    withdrawalsSnapshot.forEach((doc) => {
      const withdrawalData = doc.data();
      totalWithdrawnToday += parseFloat(withdrawalData.amount || "0");
    });

    if (totalWithdrawnToday >= withdrawalLimit) {
      return NextResponse.json(
        {
          message: "You have reached your daily withdrawal limit.",
          limitReached: true,
          totalWithdrawnToday,
          withdrawalLimit,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          message: "You can proceed with the withdrawal.",
          limitReached: false,
          totalWithdrawnToday,
          withdrawalLimit,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error checking withdrawal limit:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}