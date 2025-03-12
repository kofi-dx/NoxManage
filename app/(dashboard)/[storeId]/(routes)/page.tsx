import { getGraphTotalRevenue } from "@/actions/get-graph-total-revenue";
import { getTotalProducts } from "@/actions/get-total-products";
import { getStoreAmount } from "@/actions/get-total-revenue";
import { getOrderTotalRevenueByCategory } from "@/actions/get-total-revenue-by-category";
import { getOrderPaymentStatusTotalRevenue } from "@/actions/get-total-revenue-by-order-status";
import { getOrderStatusTotalRevenue } from "@/actions/get-total-revenue-by-orders-statu";
import { getTotalSales } from "@/actions/get-total-sales";
import { Heading } from "@/components/heading";
import Overview from "@/components/overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatNumber, formatter } from "@/lib/utils";
import { DollarSign } from "lucide-react";


export type paramsType = Promise<{ storeId: string }>;

type Props = {
  params: paramsType;
};

type GraphData = {
  name: string;
  total: number;
  seconds?: number; // Assuming that seconds might be present in the data (timestamp)
};

type CleanedGraphData = {
  name: string;
  total: number;
};

const cleanData = (data: GraphData[]): CleanedGraphData[] => {
  return data.map((item) => {
    if (item.seconds) {
      return { ...item, name: new Date(item.seconds * 1000).toISOString() };
    }
    return {
      ...item,
      total: parseFloat(formatNumber(item.total).replace(/[^0-9.]/g, "")), // Remove suffixes for graph data
    };
  });
};


const DashboardOverview = async ({ params }: Props) => {
  const { storeId } = await params;

  // Fetch required data
  const totalRevenue = await getStoreAmount(storeId);
  const totalSales = await getTotalSales(storeId);
  const totalProducts = await getTotalProducts(storeId);

  const monthlyGraphRevenue = cleanData(await getGraphTotalRevenue(storeId));
  const orderStatusTotalRevenue = cleanData(await getOrderPaymentStatusTotalRevenue(storeId));
  const revenueByCategory = cleanData(await getOrderTotalRevenueByCategory(storeId)); // Fetch revenue by category
  const revenueByOrderStatus = cleanData(await getOrderStatusTotalRevenue(storeId));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading title="Dashboard" description="Overview of your store" />
        <Separator />

        <div className="grid gap-4 grid-cols-4">
          {/* Total Revenue */}
          <Card className="col-span-2">
            <CardHeader className="flex items-center justify-between flex-row">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatter.format(totalRevenue)}</div>
            </CardContent>
          </Card>

          {/* Sales */}
          <Card className="col-span-1">
            <CardHeader className="flex items-center justify-between flex-row">
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{formatNumber(totalSales)}</div>
            </CardContent>
          </Card>

          {/* Products */}
          <Card className="col-span-1">
            <CardHeader className="flex items-center justify-between flex-row">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{formatNumber(totalProducts)}</div>
            </CardContent>
          </Card>

          {/* Monthly Revenue */}
          <Card className="col-span-3">
            <CardHeader className="flex items-center justify-between flex-row">
              <CardTitle className="text-sm font-medium">Revenue By Month</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Overview data={monthlyGraphRevenue} />
            </CardContent>
          </Card>

          {/* Revenue By Payment Sales */}
          <Card className="col-span-1">
            <CardHeader className="flex items-center justify-between flex-row">
              <CardTitle className="text-sm font-medium">Revenue By Payment Sales</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Overview data={orderStatusTotalRevenue} />
            </CardContent>
          </Card>

          {/* Revenue By Category */}
          <Card className="col-span-1">
            <CardHeader className="flex items-center justify-between flex-row">
              <CardTitle className="text-sm font-medium">Revenue By Category</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Overview data={revenueByCategory} />
            </CardContent>
          </Card>

          {/* Revenue By Order Status */}
          <Card className="col-span-1">
            <CardHeader className="flex items-center justify-between flex-row">
              <CardTitle className="text-sm font-medium">Revenue By Order Status</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Overview data={revenueByOrderStatus} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
