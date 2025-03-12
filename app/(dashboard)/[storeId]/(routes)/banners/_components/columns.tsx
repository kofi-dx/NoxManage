import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CellImage } from "./cell-image";
import { CellAction } from "./cell-actions";

export type BannerColumns = {
  id: string;
  label: string;
  imageUrl: string;
  createdAt?: string;
  isActive: boolean; // Include isActive status in the column definition
};

export const columns: ColumnDef<BannerColumns>[] = [
  {
    accessorKey: "imageUrl",
    header: "Image",
    cell: ({ row }) => <CellImage imageUrl={row.original.imageUrl} />,
  },
  {
    accessorKey: "label",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Name <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Date <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <span>{row.original.isActive ? "Active" : "inActive"}</span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
