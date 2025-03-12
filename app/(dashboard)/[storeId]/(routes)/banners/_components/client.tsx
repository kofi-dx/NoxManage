"use client"

import { Heading } from "@/components/heading"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { BannerColumns, columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"

interface BannerClientProps{
  data: BannerColumns[]
}

export const BannerClient = ({data} : BannerClientProps) => {

    const params = useParams()
    const router = useRouter()

  return (
    <>
        <div className="flex items-center justify-between">
            <Heading 
            title={`Banners (${data.length})`} 
            description="Manage banners for your store"
            />
            <Button onClick={() => router.push(`/${params.storeId}/banners/create`)}>
                <Plus className="h-4 w-4 mr-2"/>
                Add New
            </Button>

            
        </div>
        
        <Separator />

          <DataTable searchKey="label" columns={columns} data={data}/>
    </>
  )
}
