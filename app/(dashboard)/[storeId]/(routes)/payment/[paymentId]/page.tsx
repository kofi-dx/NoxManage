import { db } from "@/lib/firebase";
import { Payment } from "@/types-db";
import { doc, getDoc } from "firebase/firestore";
import PaymentForm from "./_components/payment-form";

export type paramsType = Promise<{ storeId: string; paymentId: string }>;

type Props = {
  params: paramsType;
};

const PaymentPage = async ({ params }: Props) => {
  const { storeId, paymentId } = await params;

  const paymentDoc = await getDoc(doc(db, "stores", storeId, "payments", paymentId));
  const payment = paymentDoc.exists() ? (paymentDoc.data() as Payment) : null;

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <PaymentForm initialData={payment} />
      </div>
    </div>
  );
};

export default PaymentPage;