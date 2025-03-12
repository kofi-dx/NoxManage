"use client"

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { OfferColumns, columns } from "./columns";
import ApiList from "@/components/api-list";

interface OfferClientProps {
  data: OfferColumns[];
}

export const OfferClient = ({ data }: OfferClientProps) => {
  const params = useParams();
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Special Offers (${data.length})`} description="Manage special offers for your store" />

        <Button onClick={() => router.push(`/${params.storeId}/offers/create`)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </div>

      <Separator />

      <DataTable searchKey="title" columns={columns} data={data} />

      <Heading title="API" description="API calls for special offers" />
      <Separator />
      <ApiList entityName="specialOffers" entityNameId="offerId" />
    </>
  );
};
