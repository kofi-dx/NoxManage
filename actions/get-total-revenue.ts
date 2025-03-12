
import { db } from "@/lib/firebase"; 
import { doc, getDoc } from "firebase/firestore"; 

// Function to get the store amount
export const getStoreAmount = async (storeId: string) => {
  if (!storeId) {
    console.error("Invalid storeId provided");
    return 0;
  }

  try {
    const storeDoc = await getDoc(doc(db, "stores", storeId));
    if (storeDoc.exists()) {
      const storeData = storeDoc.data();
      const storeAmount = parseFloat(storeData.amount || "0");
      return storeAmount;
    } else {
      console.error("Store document not found");
      return 0;
    }
  } catch (error) {
    console.error("Error fetching store amount:", error);
    throw error;
  }
};


 