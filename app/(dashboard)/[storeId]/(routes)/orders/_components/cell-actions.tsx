"use client";

import { useParams, useRouter } from "next/navigation";
import { OrderColumns } from "./columns";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, Edit, MoreVertical, Trash } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { AlertModal } from "@/components/modal/alert-modal";

interface OrderUpdateData {
  id: string;
  order_status: string;
}

interface CellActionProps {
  data: OrderColumns;
}

export const CellAction = ({ data }: CellActionProps) => {
  const router = useRouter();
  const params = useParams();

  console.log("CellAction Data:", data); // Debugging
  console.log("Params:", params); // Debugging

  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("Order id copied");
  };
  
  const onDelete = async () => {
    try {
      setIsLoading(true);
      console.log("Deleting Order - Store ID:", params.storeId, "Order ID:", data.id); // Debugging
      await axios.delete(`/api/${params.storeId}/orders/${data.id}`);
      toast.success("Order Removed");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };

  const onUpdate = async (data: OrderUpdateData) => {
    try {
      setIsLoading(true);
      console.log("Updating Order - Store ID:", params.storeId, "Order ID:", data.id, "Order Status:", data.order_status); // Debugging
      await axios.patch(`/api/${params.storeId}/orders/${data.id}`, data);
      toast.success("Order Updated");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={isLoading}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="h-8 w-8 p-0" variant={"ghost"}>
            <span className="sr-only">Open</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Action</DropdownMenuLabel>

          <DropdownMenuItem onClick={() => onCopy(data.id)}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Id
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => onUpdate({ id: data.id, order_status: "Delivering" })}>
            <Edit className="h-4 w-4 mr-2" />
            Delivering
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => onUpdate({ id: data.id, order_status: "Delivered" })}>
            <Edit className="h-4 w-4 mr-2" />
            Delivered
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};