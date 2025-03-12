"use client";

import { Heading } from "@/components/heading";
import { AlertModal } from "@/components/modal/alert-modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Product, Offer } from "@/types-db";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { CalendarIcon, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { Timestamp } from "firebase/firestore";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { PercentagePrice } from "@/components/percentagePrice";

interface OfferFormProps {
  initialData?: Offer;
  products: Product[];
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  discountPercentage: z.coerce.number().min(1, "Discount percentage must be at least 1"),
  description: z.string().min(1, "Description is required"),
  products: z.array(z.string()).min(1, "At least one product must be selected"),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  isActive: z.boolean().default(false),
});

export const OfferForm: React.FC<OfferFormProps> = ({ initialData, products }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false); // For modal handling
  const router = useRouter();
  const params = useParams();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      discountPercentage: initialData?.discountPercentage || 0,
      description: initialData?.description || "",
      products: initialData?.products || [],
      startDate: initialData?.startDate instanceof Timestamp
        ? initialData.startDate.toDate() // Convert Timestamp to Date
        : new Date(),
      endDate: initialData?.endDate instanceof Timestamp
        ? initialData.endDate.toDate() // Convert Timestamp to Date
        : new Date(),
      isActive: initialData?.isActive || false,
    },
  });

  const startDate = form.watch('startDate');
  const endDate = form.watch('endDate');

  console.log('Form values:', form.getValues());  // Log form values

  const title = initialData ? "Create Offer" : "Edit Offer";
  const description = initialData ? "Add a new offer" : "Edit an offer ";
  const toastMessage = initialData ? "Offer created successfully" : "Offer updated successfully";

  const handleProductChange = (productId: string) => {
    const selectedProducts = form.getValues("products");
    const updatedProducts = selectedProducts.includes(productId)
      ? selectedProducts.filter((id) => id !== productId)
      : [...selectedProducts, productId];
    form.setValue("products", updatedProducts);
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log('Submitting form data:', data);  // Log the form data being submitted
    try {
      setIsLoading(true);
      if (initialData) {
        await axios.patch(`/api/${params.storeId}/offers/${params.offerId}`, data);
        console.log('Update response:');  // Log API response

      } else {
        await axios.post(`/api/${params.storeId}/offers`, data);
        console.log('Create response:');  // Log API response
      }
      toast.success(toastMessage);
      router.push(`/${params.storeId}/offers`);
    } catch (error) {
      console.error('API error:', error);  // Log error if the request fails
      toast.error("An error occurred while processing your request");
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  const onDelete = async () => {
    try {
      setIsLoading(true);
      const response = await axios.delete(`/api/${params.storeId}/offers/${params.offerId}`);
      console.log('Delete response:', response);  // Log delete API response
      toast.success("Offer removed successfully");
      router.push(`/${params.storeId}/offers`);
    } catch (error) {
      console.error('Delete error:', error);  // Log delete error
      toast.error("Failed to delete the offer");
    } finally {
      setIsLoading(false);
      setOpen(false);
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

      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={isLoading}
            variant="destructive"
            size="icon"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} placeholder="Title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discountPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount Percentage</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={isLoading}
                      placeholder="0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Enter description..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-3 gap-8">
            {/* Start Date */}
            <FormField
              control={form.control}
              name="startDate"
              render={() => (
                <FormItem>
                  <div className="flex flex-col space-y-2">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[280px] justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => {
                            const selectedDate = date ?? new Date(); // Provide a fallback value
                            form.setValue("startDate", selectedDate);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* End Date */}
            <FormField
              control={form.control}
              name="endDate"
              render={() => (
                <FormItem>
                  <div className="flex flex-col space-y-2">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[280px] justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={(date) => {
                            const selectedDate = date ?? new Date(); // Provide a fallback value
                            form.setValue("endDate", selectedDate);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Active Checkbox */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => {
                console.log("isActive value:", field.value); // Log the current value of isActive
                return (
                  <FormItem className="flex items-start space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          console.log("isActive changed to:", checked); // Log changes to isActive
                          field.onChange(checked);
                        }}
                      />
                    </FormControl>
                    <div>
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        This offer will be visible in the store.
                      </FormDescription>
                    </div>
                  </FormItem>
                );
              }}
            />

          </div>

          <div className="grid grid-cols-3 gap-8">
            {/* Select Products */}
            <FormField
              control={form.control}
              name="products"
              render={() => (
                <FormItem>
                  <FormLabel>Products</FormLabel>
                  <div className="space-y-2">
                    {products.map((product) => (
                      <div key={product.id} className="flex items-center">
                        <Checkbox
                          checked={form.getValues("products").includes(product.id)}
                          onCheckedChange={() => handleProductChange(product.id)}
                        />
                        <span className="ml-2">{product.name}</span>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Display PercentagePrice for selected products */}
          <PercentagePrice
            products={products.filter((product) =>
              form.getValues("products").includes(product.id)
            )}
            discountPercentage={form.getValues("discountPercentage") || 0}
          />

          <Button
            disabled={isLoading || !form.formState.isValid || !form.formState.isDirty}
            type="submit"
          >
            {isLoading ? "Saving..." : initialData ? "Save Changes" : "Create Offer"}
          </Button>
        </form>
      </Form>
    </>
  );
};