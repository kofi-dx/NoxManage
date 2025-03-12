

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PaymentClient } from "./_components/client";
import { Payment } from "@/types-db";
import { PaymentColumns } from "./_components/columns";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";
import { auth } from "@clerk/nextjs/server";

function isTimestamp(value: unknown): value is Timestamp {
  return value instanceof Timestamp;
}

export type paramsType = Promise<{ storeId: string }>;

type Props = {
  params: paramsType;
};

const PaymentsPage = async ( { }: Props) => {
  const { userId } = await auth();

  if (!userId) {
    console.error("Failed to retrieve user ID from Clerk authentication.");
    return <div>Please sign in to view payment history.</div>;
  }

  let userDoc;
  try {
    userDoc = await getDoc(doc(db, "users", userId));
  } catch (error) {
    console.error("Error fetching user document:", error);
    return <div>An error occurred while fetching user data.</div>;
  }

  const userData = userDoc.data();
  const paymentHistory = (userData?.paymentHistory || []) as Payment[];

  const formattedPayments: PaymentColumns[] = paymentHistory.map((item) => ({
    id: item.id,
    storeId: item.storeId, // This is now string[]
    amount: item.amount,
    paymentMethod: item.paymentMethod,
    paymentProvider: item.paymentProvider,
    status: item.status,
    transactionId: item.transactionId,
    createdAt: isTimestamp(item.createdAt)
      ? format(item.createdAt.toDate(), "MMMM d, yyyy")
      : "",
  }));
  

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <PaymentClient data={formattedPayments} />
      </div>
    </div>
  );
};

export default PaymentsPage;
