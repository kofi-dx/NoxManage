import { db } from "@/lib/firebase";
import { Banner, Category } from "@/types-db";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { CategoryFrom } from "./_components/category-form";


export type paramsType = Promise<{ categoryId: string; storeId: string }>;

type Props = {
  params: paramsType;
};

const CategoryPage = async ({ params }: Props) => {
    const { storeId, categoryId } = await params;

    const category = (await getDoc(doc(db, "categories", categoryId))).data() as Category;
   
     // Fetch banners that match the storeId
      const bannersQuery = query(
        collection(db, "banners"),
        where("storeId", "==", storeId)
      );
    
      const bannersSnapshot = await getDocs(bannersQuery);
      const bannersData = bannersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Banner[];
    
    return ( 
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <CategoryFrom initialData={category} banners={bannersData} />
            </div>
        </div>
     );
}
 
export default CategoryPage;