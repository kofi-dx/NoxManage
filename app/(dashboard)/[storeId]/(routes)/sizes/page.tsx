import { collection, doc, getDocs } from "firebase/firestore";
import { SizeClient } from "./_components/client";
import { db } from "@/lib/firebase";
import { Size } from "@/types-db";
import { SizeColumns } from "./_components/columns";
import { convertTimestampToDateString } from "@/lib/utils";

export type paramsType = Promise<{ storeId: string; }>;

type Props = {
  params: paramsType;
};

const SizesPage = async ({ params }: Props) => {
  const { storeId } = await params;

  const SizesData = (
    await getDocs(collection(doc(db, "stores", storeId), "sizes"))
  ).docs.map((doc) => doc.data()) as Size[];

  const formattedSizes: SizeColumns[] = SizesData.map((item) => ({
    id: item.id,
    name: item.name,
    value: item.value,
    createdAt: convertTimestampToDateString(item.createdAt),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SizeClient data={formattedSizes} />
      </div>
    </div>
  );
};

export default SizesPage;
