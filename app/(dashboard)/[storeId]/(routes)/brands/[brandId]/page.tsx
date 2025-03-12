import { db } from "@/lib/firebase";
import { Brand } from "@/types-db";
import { doc, getDoc } from "firebase/firestore";
import { BrandFrom } from "./_components/brands-form";

export type paramsType = Promise<{ brandId: string; storeId: string }>;

type Props = {
  params: paramsType;
};

const BrandPage = async ({ params }: Props) => {
  const { brandId, storeId } = await params;

  const brandDoc = await getDoc(doc(db, "stores", storeId, "brands", brandId));
  const brandData = brandDoc.data();

  if (!brandData) {
    return <div>Brand not found</div>;
  }

  const brand: Brand = {
    id: brandDoc.id,
    name: brandData?.name || "",
    value: brandData?.value || "",
    createdAt: brandData?.createdAt ? brandData.createdAt.toDate().toISOString() : "",
    updatedAt: brandData?.updatedAt ? brandData.updatedAt.toDate().toISOString() : "",
    storeId: brandData?.storeId || "",
  };

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BrandFrom initialData={brand} />
      </div>
    </div>
  );
};

export default BrandPage;