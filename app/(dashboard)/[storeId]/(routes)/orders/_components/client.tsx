
"use client"

import { Heading } from "@/components/heading"
import { DataTable } from "@/components/ui/data-table"
import { Separator } from "@/components/ui/separator"
import { columns, OrderColumns } from "./columns"

interface OrdersClientProps{
  data: OrderColumns[];
}

export const OrdersClient = ({data} : OrdersClientProps) => {


  return (
    <>
        <div className="flex items-center justify-between">
            <Heading 
            title={`Orders (${data.length})`} 
            description="Manage orders for your store"
            />

            
        </div>
        
        <Separator />

          <DataTable searchKey="name" columns={columns} data={data}/>
    </>
  )
}
