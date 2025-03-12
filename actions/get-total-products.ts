import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export const getTotalProducts = async (storeId: string) => {
  // Query products where `storeId` matches the provided storeId
  const productsQuery = query(
    collection(db, "products"), // Query the "products" collection
    where("storeRef", "==", storeId) // Filter by storeId
  );

  const productsData = await getDocs(productsQuery);
  return productsData.size; // Return the count of products
};