import { NextResponse } from "next/server";
import { doc, getDoc, collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/firebase";
import { createRecipientAndTransferBatch } from "@/lib/paystack";

const MAX_TRANSFER_AMOUNT = 2000;
const PLATFORM_FEE_PERCENTAGE = 0.06;
const DAILY_WITHDRAWAL_LIMIT_PERCENTAGE = 0.6;

interface RequestBody {
  amount: number;
  momoProvider: string;
  momoNumber: string;
  firstName: string;
  lastName: string;
}

export type paramsType = Promise<{ storeId: string }>;

export async function POST(req: Request, { params }: { params: paramsType }) {
  try {
    const { storeId } = await params;
    const authResult = await auth();
    const userId = authResult?.userId;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: Missing user ID" },
        { status: 401 }
      );
    }

    const { amount, momoProvider, momoNumber, firstName, lastName } =
      (await req.json()) as RequestBody;

    if (!amount || amount <= 0 || amount > MAX_TRANSFER_AMOUNT) {
      return NextResponse.json(
        { error: "Invalid withdrawal amount" },
        { status: 400 }
      );
    }

    if (!momoProvider || !momoNumber || !/^\d{10}$/.test(momoNumber)) {
      return NextResponse.json(
        { error: "Invalid MoMo details" },
        { status: 400 }
      );
    }

    const userDoc = await getDoc(doc(db, "users", userId));
    const storeDoc = await getDoc(doc(db, "stores", storeId));

    if (!userDoc.exists() || !storeDoc.exists()) {
      return NextResponse.json(
        { error: "User or store not found" },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const storeData = storeDoc.data();

    const isAssociated = userData.storeRef.some(
      (store: { id: string }) => store.id === storeId
    );

    if (!isAssociated) {
      return NextResponse.json(
        { error: "Unauthorized: Store not associated with user" },
        { status: 403 }
      );
    }

    const storeBalance = parseFloat(storeData.amount || "0");
    const tax = amount * PLATFORM_FEE_PERCENTAGE;
    const totalDeduction = amount + tax;

    if (totalDeduction > storeBalance) {
      return NextResponse.json(
        { error: "Insufficient funds" },
        { status: 400 }
      );
    }

    const withdrawalLimit = storeBalance * DAILY_WITHDRAWAL_LIMIT_PERCENTAGE;

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

    if (totalWithdrawnToday + amount > withdrawalLimit) {
      return NextResponse.json(
        { error: "You have reached your daily withdrawal limit." },
        { status: 400 }
      );
    }

    const netAmountInKobo = Math.round(amount * 100);

    const response = await createRecipientAndTransferBatch([
      {
        amount: netAmountInKobo,
        momoNumber,
        momoProvider,
        reason: "Withdrawal",
        firstName,
        lastName,
        userId,
        storeId,
        tax,
      },
    ]);

    return NextResponse.json({
      message: "Withdrawal processed successfully",
      response,
    });
  } catch (error) {
    console.error("Unexpected error during withdrawal:", error);
    return NextResponse.json(
      { error: "Failed to process withdrawal" },
      { status: 500 }
    );
  }
}