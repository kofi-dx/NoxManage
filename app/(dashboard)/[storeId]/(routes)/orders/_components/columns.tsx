"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CellAction } from "./cell-actions";
import CellImage from "./cell-image";
import { cn } from "@/lib/utils";

export type OrderColumns = {
  id: string;
  clientName: string;
  phone: string;
  address: string;
  products: string;
  amount: string;
  images: string[];
  isPaid: boolean;
  order_status: string;
  createdAt: string;
};

export const columns: ColumnDef<OrderColumns>[] = [
  {
    accessorKey: "images",
    header: "Images",
    cell: ({ row }) => (
      <div className="grid grid-cols-2 gap-2">
        <CellImage data={row.original.images} />
      </div>
    ),
  },
  {
    accessorKey: "products",
    header: "Products",
  },
  {
    accessorKey: "clientName",
    header: "Name",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
  {
    accessorKey: "order_status",
    header: "Status",
    cell: ({ row }) => {
      const { order_status } = row.original;

      return (
        <p
          className={cn(
            "text-base font-semibold",
            order_status === "Pending" && "text-yellow-500" ||
            order_status === "Delivering" && "text-orange-500" ||
            order_status === "Delivered" && "text-emerald-500" ||
            order_status === "Cancelled" && "text-red-500" ||
            order_status === "Refunded" && "text-blue-500"
          )}
        >
          {order_status}
        </p>
      );
    },
  },
  {
    accessorKey: "isPaid",
    header: "Payment Status",
    cell: ({ row }) => {
      const { isPaid, order_status } = row.original;

      const paymentStatus = order_status === "Refunded" 
        ? "Refunded"
        : isPaid 
        ? "Paid" 
        : "Not Paid";

      return (
        <p
          className={cn(
            "text-base font-semibold",
            paymentStatus === "Refunded" ? "text-blue-500" :
            isPaid ? "text-emerald-500" : "text-red-500"
          )}
        >
          {paymentStatus}
        </p>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];