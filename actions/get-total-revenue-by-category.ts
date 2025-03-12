import { db } from "@/lib/firebase";
import { Category, Order } from "@/types-db";
import { collection, query, where, getDocs, doc } from "firebase/firestore";

interface GraphData {
  name: string;
  total: number;
}

export const getOrderTotalRevenueByCategory = async (storeId: string) => {
  // Fetch orders for the store
  const ordersData = (
    await getDocs(collection(doc(db, "stores", storeId), "orders"))
  ).docs.map((doc) => doc.data()) as Order[];

  // Fetch categories for the store
  const categoriesQuery = query(
    collection(db, "categories"), // Query the "categories" collection
    where("storeRef", "==", storeId) // Filter by storeId
  );

  const categories = (await getDocs(categoriesQuery)).docs.map((doc) => doc.data()) as Category[];

  const categoryRevenue: { [key: string]: number } = {};

  // Calculate revenue for each category
  ordersData.forEach((order) => {
    order.products.forEach((item) => {
      const category = item.category;

      if (category) {
        const revenueForItem = item.qty !== undefined ? item.price * item.qty : item.price;

        categoryRevenue[category] = (categoryRevenue[category] || 0) + revenueForItem;
      }
    });
  });

  // Ensure all categories are included in the revenue data
  categories.forEach((category) => {
    categoryRevenue[category.name] = categoryRevenue[category.name] || 0;
  });

  // Format data for the graph
  const graphData: GraphData[] = categories.map((category) => ({
    name: category.name,
    total: categoryRevenue[category.name] || 0,
  }));

  return graphData;
};