"use client";

import { useStoreModal } from "@/hooks/use-store-modal";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "@clerk/nextjs";

const SetupPage = () => {
  const { userId } = useAuth(); // Get the authenticated user's ID
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const onOpen = useStoreModal((state) => state.onOpen);
  const isOpen = useStoreModal((state) => state.isOpen);

  useEffect(() => {
    const fetchStores = async () => {
      if (!userId) return; // Ensure the user is authenticated

      try {
        // Query Firestore to check if the user has any stores
        const storesRef = collection(db, "stores");
        const storesQuery = query(storesRef, where("userId", "==", userId));
        const storeSnapshots = await getDocs(storesQuery);

        if (!storeSnapshots.empty) {
          // If the user has stores, redirect to the first store
          const firstStoreId = storeSnapshots.docs[0].id;
          router.push(`/${firstStoreId}`);
        } else {
          // If the user has no stores, open the "use client" modal
          if (!isOpen) {
            onOpen();
          }
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStores();
  }, [userId, isOpen, onOpen, router]);

  if (isLoading) {
    return null; // Show a loading state while checking for stores
  }

  return null;
};

export default SetupPage;