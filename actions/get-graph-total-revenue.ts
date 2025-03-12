import { db } from "@/lib/firebase";
import { Order } from "@/types-db";
import { collection, doc, getDocs } from "firebase/firestore";
import { Timestamp } from "firebase/firestore"; // Import Timestamp

interface GraphData {
  name: string;
  total: number;
}

// Function to calculate total revenue by month
export const getGraphTotalRevenue = async (storeId: string) => {
  const ordersData = (
    await getDocs(collection(doc(db, "stores", storeId), "orders"))
  ).docs.map((doc) => doc.data()) as Order[];

  const paidOrders = ordersData.filter((order) => order.isPaid);

  const monthlyRevenue: { [key: string]: number } = {};

  paidOrders.forEach((order) => {
    // Ensure orderItems is not undefined before accessing it
    if (order.products && Array.isArray(order.products)) {
      let revenueForOrder = 0;
      order.products.forEach((item) => {
        if (item.qty !== undefined) {
          revenueForOrder += item.price * item.qty;
        } else {
          revenueForOrder += item.price;
        }
      });
  
      const createdAt = order.createdAt as Timestamp;
      const month = createdAt
        .toDate()
        .toLocaleDateString("en-US", { month: "short" });
  
      if (month) {
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + revenueForOrder;
      }
    }
  });
  

  const monthMap: { [key: string]: number } = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };

  const graphData: GraphData[] = Object.keys(monthMap).map((monthName) => ({
    name: monthName,
    total: monthlyRevenue[monthName] || 0,
  }));

  return graphData;
};