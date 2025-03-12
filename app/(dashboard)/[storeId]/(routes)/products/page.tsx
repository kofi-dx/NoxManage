import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { ProductsClient } from "./_components/client";
import { db } from "@/lib/firebase";
import { Product, Store } from "@/types-db";
import { ProductColumns } from "./_components/columns";
import { convertTimestampToDateString, formatter } from "@/lib/utils";
import { convertToPlainObject } from "@/lib/utils"; // Import the utility function


export type paramsType = Promise<{ storeId: string }>;

type Props = {
  params: paramsType;
};

const ProductsPage = async ({ params }: Props) => {
  const { storeId } = await params;

  // Fetch store document to retrieve productRefs
  const storeRef = doc(db, "stores", storeId);
  const storeDoc = await getDoc(storeRef);

  const storeData = storeDoc.data() as Store;
  const productRefs = storeData.productRefs;

  let formattedProducts: ProductColumns[] = [];

  // Check if the store has product references
  if (productRefs?.length) {
    // Fetch products that match the productRefs
    const productsQuery = query(
      collection(db, "products"),
      where("id", "in", productRefs)
    );
    const querySnapshot = await getDocs(productsQuery);

    // Format the product data for the table
    const productsData: Product[] = querySnapshot.docs.map((doc) =>
      doc.data()
    ) as Product[];

    formattedProducts = productsData.map((item) => ({
      id: item.id,
      name: item.name,
      descriptions: item.descriptions,
      price: formatter.format(item.price),
      isArchived: item.isArchived ?? false,
      isFeatured: item.isFeatured ?? false,
      category: item.category,
      size: item.size,
      color: item.color,
      brand: item.brand,
      images: item.images,
      type: item.type,
      createdAt: convertTimestampToDateString(item.createdAt), // Handle the case if it's not a Timestamp
      isActive: item.isActive ?? true,
      newPrice: formatter.format(item.newPrice ?? item.price),
      discountPercentage: item.discountPercentage ?? 0,
    }));
  }

  // Convert storeData and formattedProducts to plain objects
  const plainStoreData = convertToPlainObject(storeData);
  const plainFormattedProducts = convertToPlainObject(formattedProducts);

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductsClient data={plainFormattedProducts} store={plainStoreData} />
      </div>
    </div>
  );
};

export default ProductsPage;