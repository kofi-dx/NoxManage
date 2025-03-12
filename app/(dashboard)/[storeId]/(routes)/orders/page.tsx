import { collection, doc, getDocs } from "firebase/firestore";
import { OrdersClient } from "./_components/client";
import { db } from "@/lib/firebase";
import { Order } from "@/types-db";
import { format } from "date-fns";
import { formatter } from "@/lib/utils";
import { OrderColumns } from "./_components/columns";

export type paramsType = Promise<{ storeId: string }>;

type Props = {
  params: paramsType;
};

export const revalidate = 0;

const OrdersPage = async ({ params }: Props) => {
  const { storeId } = await params;

  const ordersData = (
    await getDocs(collection(doc(db, "stores", storeId), "orders"))
  ).docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Order[];

  const formattedOrders: OrderColumns[] = ordersData.map((item) => ({
    id: item.id,
    clientId: item.clientId,
    isPaid: item.isPaid,
    phone: item.phone,
    clientName: item.clientName,
    address: item.address,
    products: item.products?.map((item) => item.name).join(", ") || "",
    order_status: item.order_status,
    amount: formatter.format(Number(item.amount)),
    images: item.products?.map((item) => item.images?.[0]?.url) || [],
    createdAt: item.createdAt
      ? "toDate" in item.createdAt
        ? format(item.createdAt.toDate(), "MMMM d, yyyy")
        : ""
      : "",
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrdersClient data={formattedOrders} />
      </div>
    </div>
  );
};

export default OrdersPage;