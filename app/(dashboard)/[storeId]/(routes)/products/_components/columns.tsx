"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CellAction } from "./cell-actions";

// Define the type for product columns
export type ProductColumns = {
  id: string;
  name: string;
  descriptions: string;
  price: string;
  isActive: boolean;
  newPrice: string;
  discountPercentage: number;
  isArchived: boolean;
  isFeatured: boolean;
  category: string;
  size: string;
  color: string;
  brand: string;
  images: { url: string }[];
  type: "men" | "women" | "unisex";
  createdAt: string;
};


// Define the columns for the table
export const columns: ColumnDef<ProductColumns>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  //{
  //  accessorKey: "newPrice",
  //  header: "New Price",
  //},
  //{
  //  accessorKey: "discountPercentage",
  //  header: "Discount",
  //},
  //{
  //  accessorKey: "isActive",
  //  header: "Active",
  //},
  {
    accessorKey: "isFeatured",
    header: "Featured",
  },
  {
    accessorKey: "isArchived",
    header: "Archived",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "size",
    header: "Size",
  },
  {
    accessorKey: "color",
    header: "Color",
  },
  {
    accessorKey: "brand",
    header: "Brand",
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
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
