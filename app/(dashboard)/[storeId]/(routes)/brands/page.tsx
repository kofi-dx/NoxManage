import { collection, getDocs } from "firebase/firestore";
import { BrandClient } from "./_components/client";
import { db } from "@/lib/firebase";
import { Brand } from "@/types-db";
import { BrandColumns } from "./_components/columns";
import { format } from "date-fns";
import { Timestamp, FieldValue } from "firebase/firestore";

// Type guard for Timestamp
function isTimestamp(value: FieldValue | Timestamp): value is Timestamp {
  return value instanceof Timestamp;
}

type PageProps = {
  params: Promise<{ storeId: string }>;
};

const BrandsPage = async ({ params }: PageProps) => {
  const { storeId } = await params;

  // Fetch brands from the "brands" subcollection of the store
  const brandsSnapshot = await getDocs(collection(db, "stores", storeId, "brands"));

  // Map the documents to the Brand type
  const brandsData = brandsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Brand[];

  // Format the brands for the client component
  const formattedBrands: BrandColumns[] = brandsData.map((item) => ({
    id: item.id,
    name: item.name,
    value: item.value,
    createdAt: isTimestamp(item.createdAt)
      ? format(item.createdAt.toDate(), "MMMM d, yyyy")
      : "", // Handle the case if it's not a Timestamp
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BrandClient data={formattedBrands} />
      </div>
    </div>
  );
};

export default BrandsPage;