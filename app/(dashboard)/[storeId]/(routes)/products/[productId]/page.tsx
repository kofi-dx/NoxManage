import { db } from "@/lib/firebase";
import { Category, Color, Brand, Product, Size } from "@/types-db";
import { collection, doc, getDoc, getDocs, DocumentData, Timestamp } from "firebase/firestore";
import { ProductFrom } from "./_components/product-form";

// Utility function to convert Firestore timestamps to plain objects
const convertTimestamp = (data: DocumentData) => {
  if (data.createdAt && data.createdAt instanceof Timestamp) {
    data.createdAt = data.createdAt.toDate(); // Convert Timestamp to Date
  }
  if (data.updatedAt && data.updatedAt instanceof Timestamp) {
    data.updatedAt = data.updatedAt.toDate(); // Convert Timestamp to Date
  }
  return data;
};

export type paramsType = Promise<{ storeId: string; productId: string }>;

type Props = {
  params: paramsType;
};


const defaultProduct: Product = {
  id: "",
  name: "",
  descriptions: "",
  price: 0,
  qty: 0,
  images: [],
  isFeatured: false,
  isArchived: false,
  type: "unisex", // Default type
  category: "", // Default to empty string
  size: "", // Default to empty string
  color: "", // Default to empty string
  brand: "", // Default to empty string
  createdAt: Timestamp.fromDate(new Date()), // Use Firestore Timestamp
  updatedAt: Timestamp.fromDate(new Date()),
  newPrice: 0,
  discountPercentage: 0,
  isActive: false,
  condition: "new",
  storeRef: ""
};

const ProductPage = async ( { params}: Props ) => {
  const { storeId, productId } = await params;

  // Fetch product data and convert timestamps, if they exist
  const productDoc = await getDoc(doc(db, "stores", storeId, "products", productId));
  const product = productDoc.exists()
    ? convertTimestamp(productDoc.data() as DocumentData) as Product
    : defaultProduct;

  // Fetch categories, sizes, brands, and colors data and convert timestamps, if they exist
  const categoriesData = (
    await getDocs(collection(db, "categories")) // Fetch sizes globally or from a store-specific collection
  ).docs.map(doc => convertTimestamp(doc.data()) as Category);

  const sizesData = (
    await getDocs(collection(db, "sizes")) // Fetch sizes globally or from a store-specific collection
  ).docs.map(doc => convertTimestamp(doc.data()) as Size);

  const brandsData = (
    await getDocs(collection(doc(db, "stores", storeId), "brands"))
  ).docs.map(doc => convertTimestamp(doc.data()) as Brand);

  const colorsData = (
    await getDocs(collection(db, "colors")) // Fetch sizes globally or from a store-specific collection
  ).docs.map(doc => convertTimestamp(doc.data()) as Color);


  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductFrom
          initialData={product}
          categories={categoriesData}
          sizes={sizesData}
          brands={brandsData}
          colors={colorsData}
        />
      </div>
    </div>
  );
};

export default ProductPage;
