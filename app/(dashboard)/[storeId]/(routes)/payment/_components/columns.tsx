"use client";

// Import necessary functions and components
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CellAction } from "./cell-actions";
import { WithdrawForm } from "./withdrawForm";
import { useState, useEffect } from "react"; // Make sure to update the import path accordingly
import { getStoreAmount } from "@/actions/get-total-revenue";
import { formatter } from "@/lib/utils";

export type PaymentColumns = {
  storeId: string[]; // Update this to string[]
  id: string;
  amount: number;
  paymentMethod: string;
  paymentProvider: string;
  status: "pending" | "completed" | "failed";
  transactionId: string;
  createdAt: string;
  paymentDetails?: {
    momoProvider?: string;
    momoNumber?: string;
    bankCode?: string;
    accountNumber?: string;
    accountName?: string;
  };
};

const StoreAmountCell = ({ storeId }: { storeId: string }) => {
  const [storeAmount, setStoreAmount] = useState<number | null>(null);

  useEffect(() => {
    const fetchStoreAmount = async () => {
      try {
        const totalRevenue = await getStoreAmount(storeId);
        setStoreAmount(totalRevenue);
      } catch (error) {
        console.error("Failed to fetch store amount:", error);
      }
    };

    if (storeId) {
      fetchStoreAmount();
    }
  }, [storeId]);

  return (
    <span className="font-bold">
      {storeAmount !== null ? formatter.format(storeAmount) : "Loading..."}
    </span>
  );
};

const WithdrawCell = ({ amount, paymentId }: { amount: number, paymentId: string }) => {
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);

  return (
    <>
      <Button onClick={() => setShowWithdrawForm(true)} variant="secondary">
        Withdraw
      </Button>
      {showWithdrawForm && (
        <WithdrawForm
          paymentId={paymentId}
          amount={amount}
          onClose={() => setShowWithdrawForm(false)}
        />
      )}
    </>
  );
};

export const columns = (storeId: string): ColumnDef<PaymentColumns>[] => [
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Total Money
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const storeCurrency = "GH₵"; // Example: Fetch or pass the current store's currency dynamically
      return (
        <span className="font-bold">
          {storeCurrency} {row.original.amount.toFixed(2)}
        </span>
      );
    },
  },
  {
    accessorKey: "paymentMethod",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Method
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "transactionId",
    header: "Transaction ID",
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    id: "storeAmount",
    header: "Store Amount",
    cell: () => {
      return <StoreAmountCell storeId={storeId} />; // Pass the current storeId
    },
  },
  
  {
    id: "withdraw",
    header: "Withdraw",
    cell: ({ row }) => {
      const { amount, id } = row.original;
      return <WithdrawCell amount={amount} paymentId={id} />;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
