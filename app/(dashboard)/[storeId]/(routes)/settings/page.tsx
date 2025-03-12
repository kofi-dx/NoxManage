import { db } from "@/lib/firebase";
import { Store } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import { doc, getDoc } from "firebase/firestore";
import { redirect } from "next/navigation";
import { SettingsForm } from "./components/settings-form";
import { convertTimestampToISOString } from "@/lib/utils";
import { ContactSupport } from "@/components/contact-support";
import { Separator } from "@/components/ui/separator";


export type paramsType = Promise<{ storeId: string }>;

type Props = {
  params: paramsType;
};

const SettingsPage = async ({ params }: Props) => {
  const { storeId } = await params;

  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const storeSnap = await getDoc(doc(db, "stores", storeId));
  const storeData = storeSnap.data();

  if (!storeData || storeData.userId !== userId) {
    redirect("/");
  }

  // Convert Firestore Timestamps to plain JSON-serializable values
  const store: Store = {
    ...storeData,
    createdAt: convertTimestampToISOString(storeData.createdAt),
    updatedAt: convertTimestampToISOString(storeData.updatedAt),
    subscription: {
      ...storeData.subscription,
      renewalDate: convertTimestampToISOString(storeData.subscription.renewalDate),
    },
    id: storeData.id || "",
    name: storeData.name || "",
    userId: storeData.userId || "",
    image: storeData.image || "",
    phone: storeData.phone || "",
    productRefs: storeData.productRefs || [],
    amount: storeData.amount || "",
    categoryRefs: storeData.categoryRefs || [],
    location: storeData.location || { latitude: 0, longitude: 0 }, // Provide a default location
    city: storeData.city || "",
    region: storeData.region || "Ghana",
  };

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-5 p-8 pt-6">
        <SettingsForm initialData={store} />
        <Separator className="my-8" />
        <ContactSupport /> {/* Add the ContactSupport component */}
      </div>
    </div>
  );
};

export default SettingsPage;