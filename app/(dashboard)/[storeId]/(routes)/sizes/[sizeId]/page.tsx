import { db } from "@/lib/firebase";
import { Size } from "@/types-db";
import { doc, getDoc } from "firebase/firestore";
import { SizeFrom } from "./_components/sizes-form";

export type paramsType = Promise<{ storeId: string; sizeId: string }>;

type Props = {
  params: paramsType;
};

const SizePage = async ({
    params,
} : Props) => {
    const { sizeId } = await params;
    const { storeId } = await params;
    const size = (await getDoc(doc(db, "stores", storeId, "sizes", sizeId))).data() as Size;
    



    return ( 
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <SizeFrom initialData={size}  />
            </div>
        </div>
     );
}
 
export default SizePage;