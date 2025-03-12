import { UserButton } from "@clerk/nextjs";
import { MainNav } from "./main-nav";
import { StoreSwitcher } from "./store-switcher";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Store } from "@/types-db";
import { Timestamp } from "firebase/firestore";
import { convertToPlainObject } from "@/lib/utils";

export const Navbar = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const storeSnap = await getDocs(
    query(collection(db, "stores"), where("userId", "==", userId))
  );

  const stores: Store[] = [];
  storeSnap.forEach((doc) => {
    const storeData = doc.data() as Store;

    // Handle createdAt and updatedAt fields
    const createdAt = storeData.createdAt instanceof Timestamp
      ? storeData.createdAt
      : Timestamp.now(); // Fallback to current timestamp if FieldValue

    const updatedAt = storeData.updatedAt instanceof Timestamp
      ? storeData.updatedAt
      : Timestamp.now(); // Fallback to current timestamp if FieldValue

    stores.push({
      ...storeData,
      createdAt,
      updatedAt,
    });
  });

  // Convert the stores array to a plain object array
  const plainStores = convertToPlainObject(stores);

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <StoreSwitcher items={plainStores} /> {/* Pass the plain object array */}
        <MainNav />
        <div className="ml-auto">
          <UserButton afterSwitchSessionUrl="/" />
        </div>
      </div>
    </div>
  );
};