"use client";

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { columns, ProductColumns } from "./columns";
import { Store } from "@/types-db";

interface ProductsClientProps {
  data: ProductColumns[];
  store?: Store; // Make store optional, so it's safe if not available
}

export const ProductsClient = ({ data, store }: ProductsClientProps) => {
  const params = useParams();
  const router = useRouter();

  // Safely check if the store and allowedProduct are available
  const allowedProduct = store?.subscription?.allowedProduct || 0; // Adjusted to access subscription
  const hasReachedLimit = data.length >= allowedProduct;

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Products (${data.length})`}
          description="Manage products for your store"
        />
        <Button
          onClick={() => {
            if (hasReachedLimit) {
              // Redirect to the subscription page if the limit is reached
              router.push(`/${params.storeId}/products/upgrade`);
            } else {
              // Redirect to the page for adding a new product
              router.push(`/${params.storeId}/products/create`);
            }
          }}
          className={hasReachedLimit ? "bg-red-500 hover:bg-red-600 text-white" : ""} // Highlight button when limit is reached
        >
          <Plus className="h-4 w-4 mr-2" />
          {hasReachedLimit ? "Subscribe to add more" : "Add New"}
        </Button>
      </div>

      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
    </>
  );
};
