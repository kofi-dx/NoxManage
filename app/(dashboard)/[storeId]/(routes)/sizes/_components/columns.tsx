"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"


export type SizeColumns = {
  id: string,
  value: string,
  name: string,
  createdAt: string
}

export const columns: ColumnDef<SizeColumns>[] = [

  {
    accessorKey: "name",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
  },
  //{
  //  accessorKey: "value",
  //  header: ({ column }) => {
  //     return (
  //        <Button
  //          variant="ghost"
  //          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  //        >
  //          Value
  //          <ArrowUpDown className="ml-2 h-4 w-4" />
  //        </Button>
  //      )
  //    },
  //},
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
        )
      },
  },

  //{
  //  id: "actions",
  //  cell: ({row}) => <CellAction data={row.original} />
  //}
]
