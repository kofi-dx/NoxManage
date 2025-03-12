"use client"

import { Heading } from "@/components/heading"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Separator } from "@/components/ui/separator"
import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { columns, BrandColumns } from "./columns"

interface BrandClientProps{
  data: BrandColumns[];
}

export const BrandClient = ({data} : BrandClientProps) => {

    const params = useParams()
    const router = useRouter()

  return (
    <>
        <div className="flex items-center justify-between">
            <Heading 
            title={`Brands (${data.length})`} 
            description="Manage brands for your store"
            />
            <Button onClick={() => router.push(`/${params.storeId}/brands/create`)}>
                <Plus className="h-4 w-4 mr-2"/>
                Add New
            </Button>

            
        </div>
        
        <Separator />

          <DataTable searchKey="name" columns={columns} data={data}/>

    </>
  )
}
