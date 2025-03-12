import { collection, doc, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Offer } from "@/types-db";
import { OfferColumns } from "./_components/columns";
import { format } from "date-fns";
import { OfferClient } from "./_components/client";

export type paramsType = Promise<{ storeId: string }>;

type Props = {
  params: paramsType;
};

const OffersPage = async ({ params }: Props) => {
  const { storeId } = await params;

  const offersData = (
    await getDocs(collection(doc(db, "stores", storeId), "specialOffers"))
  ).docs.map(doc => doc.data()) as Offer[];

  const formattedOffers: OfferColumns[] = offersData.map(item => ({
    id: item.id,
    title: item.title,
    discountPercentage: item.discountPercentage,
    startDate: item.startDate && isTimestamp(item.startDate) ? format(item.startDate.toDate(), "MMMM d, yyyy") : "",  // Type guard for Timestamp
    endDate: item.endDate && isTimestamp(item.endDate) ? format(item.endDate.toDate(), "MMMM d, yyyy") : "",
    isActive: item.isActive,
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OfferClient data={formattedOffers} />
      </div>
    </div>
  );
};

export default OffersPage;

// Type guard to check if a value is a Timestamp
function isTimestamp(value: unknown): value is Timestamp {
  return value instanceof Timestamp;
}
