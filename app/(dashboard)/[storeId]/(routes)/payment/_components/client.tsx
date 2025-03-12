
"use client";

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";
import { Edit } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { PaymentColumns, columns } from "./columns";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { isAfter, subDays } from "date-fns";

interface PaymentClientProps {
  data: PaymentColumns[]; // Payment data
}

export const PaymentClient = ({ data }: PaymentClientProps) => {
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const params = useParams();
  const router = useRouter();

  // Check if a payment exists and get the most recent payment
  const mostRecentPayment = data.length > 0 ? data[0] : null; // Assuming data is sorted by `createdAt`

  const isUpdateAllowed = mostRecentPayment
    ? isAfter(new Date(), subDays(new Date(mostRecentPayment.createdAt), -30))
    : false;

  const handleUpdatePayment = () => {
    if (!isLoaded || !isSignedIn) {
      signOut();
      toast.error("You need to log in again to update your payment details.");
      router.push("/login");
      return;
    }

    if (mostRecentPayment && isUpdateAllowed) {
      router.push(`/${params.storeId}/payment/update`);
    } else {
      toast.error("You can update your payment only after 30 days.");
    }
  };

  // Show "Add New" button when there is no payment data
  const handleAddNewPayment = () => {
    router.push(`/${params.storeId}/payment/add`);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading 
          title={"Payments"} 
          description="Manage payments for your store"
        />
        {mostRecentPayment ? (
          <Button onClick={handleUpdatePayment} disabled={!isUpdateAllowed}>
            <Edit className="h-4 w-4 mr-2" />
            {isUpdateAllowed ? "Update Payment" : "Update Not Allowed Yet"}
          </Button>
        ) : (
          <Button onClick={handleAddNewPayment}>
            Add New Payment
          </Button>
        )}
      </div>
        
      <Separator />
      <DataTable 
        searchKey="transactionId" 
        columns={columns(params.storeId as string)} // Pass the current storeId
        data={data} 
      />
    </>
  );
};