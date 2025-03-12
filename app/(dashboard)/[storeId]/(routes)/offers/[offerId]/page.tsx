import { db } from "@/lib/firebase";
import { Product, Offer } from "@/types-db";
import { collection, doc, getDoc, getDocs, DocumentData, Timestamp } from "firebase/firestore";
import { OfferForm } from "./_components/offer-form";

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


export type paramsType = Promise<{ storeId: string; offerId: string }>;

type Props = {
  params: paramsType;
};

const defaultOffer: Offer = {
  id: "",
  title: "",
  description: "",
  products: [], // Default to empty string
  startDate: Timestamp.fromDate(new Date()), // Use Firestore Timestamp
  endDate: Timestamp.fromDate(new Date()),
  discountPercentage: 0,
  isActive: false,
  createdAt: Timestamp.fromDate(new Date()),
  storeId: ""
};

const OfferPage = async ({ params }: Props) => {
  const { storeId, offerId } = await params;

  // Fetch product data and convert timestamps, if they exist
  const offerDoc = await getDoc(doc(db, "stores", storeId, "offers", offerId));
  const offer = offerDoc.exists()
    ? convertTimestamp(offerDoc.data() as DocumentData) as Offer
    : defaultOffer;

  // Fetch categories, sizes, brands, and colors data and convert timestamp

  const productsData = (
    await getDocs(collection(doc(db, "stores", storeId), "products"))
  ).docs.map(doc => convertTimestamp(doc.data()) as Product);

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OfferForm
          initialData={offer}
          products={productsData}
        />
      </div>
    </div>
  );
};

export default OfferPage;
