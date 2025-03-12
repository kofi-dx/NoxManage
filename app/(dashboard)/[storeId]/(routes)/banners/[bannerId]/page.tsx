import { db } from "@/lib/firebase";
import { Banner } from "@/types-db";
import { doc, getDoc } from "firebase/firestore";
import { BannerFrom } from "./_components/banner-form";


export type paramsType = Promise<{bannerId: string}>;

type Props ={
  params: paramsType;
}

const BannerPage = async ({ params }: Props) => {
  const { bannerId } = await params;

  // Fetch the banner from the top-level banners collection
  const bannerDoc = await getDoc(doc(db, "banners", bannerId));
  const bannerData = bannerDoc.data();

  if (!bannerData) {
    return <div>Banner not found</div>;
  }

  const banner: Banner = {
    id: bannerDoc.id,
    label: bannerData?.label || "",
    imageUrl: bannerData?.imageUrl || "",
    createdAt: bannerData?.createdAt ? bannerData.createdAt.toDate().toISOString() : '',
    updatedAt: bannerData?.updatedAt ? bannerData.updatedAt.toDate().toISOString() : '',
    isActive: bannerData?.isActive ?? true,
    storeId: bannerData?.storeId || "", // Ensure storeId is included
  };

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BannerFrom initialData={banner} />
      </div>
    </div>
  );
};

export default BannerPage;