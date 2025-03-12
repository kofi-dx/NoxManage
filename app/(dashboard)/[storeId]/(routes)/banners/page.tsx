import { db } from "@/lib/firebase";
import { Banner } from "@/types-db";
import { collection, getDocs, query, where } from "firebase/firestore";
import { BannerClient } from "./_components/client";
import { BannerColumns } from "./_components/columns";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";

function isTimestamp(value: unknown): value is Timestamp {
  return value instanceof Timestamp;
}

type PageProps = {
  params: Promise<{ storeId: string }>;
};

const BannersPage = async ({ params }: PageProps) => {
  const { storeId } = await params;

  const bannersQuery = query(collection(db, "banners"), where("storeId", "==", storeId));
  const bannersSnapshot = await getDocs(bannersQuery);
  const bannersData = bannersSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Banner[];

  const formattedBanners: BannerColumns[] = bannersData.map((item) => {
    let createdAtFormatted = "N/A";

    if (item.createdAt) {
      if (isTimestamp(item.createdAt)) {
        createdAtFormatted = format(item.createdAt.toDate(), "MMMM d, yyyy");
      } else if (typeof item.createdAt === "string") {
        const date = new Date(item.createdAt);
        if (!isNaN(date.getTime())) {
          createdAtFormatted = format(date, "MMMM d, yyyy");
        }
      }
    }

    return {
      id: item.id,
      label: item.label,
      imageUrl: item.imageUrl,
      isActive: item.isActive !== undefined ? item.isActive : false,
      createdAt: createdAtFormatted,
    };
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BannerClient data={formattedBanners} />
      </div>
    </div>
  );
};

export default BannersPage;