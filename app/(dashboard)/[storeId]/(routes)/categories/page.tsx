import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Category } from "@/types-db";
import { CategoryClient } from "./_components/client";
import { CategoryColumns } from "./_components/columns";
import { convertTimestampToDateString } from "@/lib/utils";

type PageProps = {
  params: Promise<{ storeId: string }>;
};

const CategoriesPage = async ({ params }: PageProps) => {
  const { storeId } = await params;

  const storeDoc = await getDoc(doc(db, "stores", storeId));
  if (!storeDoc.exists()) {
    return <div>Store not found</div>;
  }

  const storeData = storeDoc.data();
  const categoryRefs = storeData?.categoryRefs || [];

  const categoriesData = await Promise.all(
    categoryRefs.map(async (categoryId: string) => {
      const categoryDoc = await getDoc(doc(db, "categories", categoryId));
      return categoryDoc.exists() ? { id: categoryDoc.id, ...categoryDoc.data() } : null;
    })
  );

  const validCategories = categoriesData.filter(Boolean) as Category[];

  const formattedCategories: CategoryColumns[] = validCategories.map((item) => ({
    id: item.id,
    name: item.name,
    bannerLabel: item.bannerLabel,
    createdAt: convertTimestampToDateString(item.createdAt),
    updatedAt: convertTimestampToDateString(item.updatedAt),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CategoryClient data={formattedCategories} />
      </div>
    </div>
  );
};

export default CategoriesPage;