
"use client";

import { Heading } from "@/components/heading";
import ImagesUpload from "@/components/images-upload";
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
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Category, Color, Brand, Product, Size } from "@/types-db";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

interface ProductFromProps { 
  initialData: Product; 
  categories: Category[]; 
  sizes: Size[]; 
  brands: Brand[];  
  colors: Color[]; 
}

const formSchema = z.object({
  name: z.string().min(1),
  price: z.coerce.number().min(1),
  descriptions: z.string().min(1),  
  type: z.enum(["unisex", "men", "women"]),
  images: z.object({ url: z.string() }).array(),
  category: z.string().min(1),
  size: z.string().min(1),
  color: z.string().min(1),
  brand: z.string().min(1),
  condition: z.enum(["new", "used"]), 
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
});




export const ProductFrom = ({
  initialData,
  categories,
  sizes,
  brands,
  colors,
}: ProductFromProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || { 
      name: "", 
      price: 0, 
      images: [], 
      isFeatured: false, 
      isArchived: false, 
      category: "", 
      size: "", 
      brand: "", 
      color: "", 
      descriptions: "", 
      type: "unisex", 
      }, 
    });

  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const params = useParams();
  const router = useRouter();

  

  const title = initialData ? "Edit Product" : "Create Product";
  const description = initialData ? "Edit a product" : "Add a new product";
  const toastMessage = initialData ? "Product Updated" : "Product Created";

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
  
      if (initialData && initialData.id) {
        // If initialData has an id, it's an update (PATCH)
        await axios.patch(`/api/${params.storeId}/products/${initialData.id}`, data);
      } else {
        // Otherwise, it's a new product (POST)
        await axios.post(`/api/${params.storeId}/products`, data);
      }
  
      toast.success(toastMessage);
      router.push(`/${params.storeId}/products`);
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  
  
  

  const onDelete = async () => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/${params.storeId}/products/${params.productId}`);
      toast.success("Product Removed");
      location.reload();
      router.push(`/${params.storeId}/products`);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };


  return <>

  <AlertModal 
  isOpen={open} 
  onClose={() => setOpen(false)}
  onConfirm={onDelete}
  loading= {isLoading}
  />

    <div className="flex items-center justify-center">
        <Heading title={title} description={description}/>
        {initialData &&(
            <Button 
            disabled= {isLoading}
            variant={"destructive"} 
            size={"icon"} 
            onClick={() => setOpen(true)}>
            <Trash className="h-4 w-4"/>
        </Button>
        )}
    </div>

    <Separator />
    
      <Form {...form} >
        <form onSubmit={form.handleSubmit(onSubmit)} 
              className="w-full space-y-8">

                {/** Image **/}

                <FormField 
                control={form.control}
                name="images"
                render={({field}) => (
                    <FormItem>
                        <FormLabel>Product Images</FormLabel>
                        <FormControl>
                            <ImagesUpload 
                            value={field.value.map(image => image.url)}
                            onChange={(urls) => {
                              field.onChange(urls.map((url) => ({url})))
                            }}
                            onRemove={(url) => {
                              field.onChange(
                                field.value.filter(current => current.url !== url)
                              )
                            }}/>
                        </FormControl>
                    </FormItem>
                )}
                />
                
            <div className="grid grid-cols-3 gap-8">

            <FormField 
                control={form.control}
                name="name"
                render={ ({field}) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          placeholder="Product name..."
                          {...field}
                            />
                        </FormControl>
                      <FormMessage />
                  </FormItem>
                    )}
                  />
                  <FormField 
                control={form.control}
                name="price"
                render={ ({field}) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
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
                    name="descriptions"  // This should match the schema field name
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input
                            disabled={isLoading}
                            placeholder="Product description..."
                            {...field}  // Ensure field binding here
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />


                  <FormField 
                control={form.control}
                name="category"
                render={ ({field}) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                      <Select 
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                            defaultValue={field.value}
                            placeholder="Select a category">
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem 
                            key={category.id} 
                            value={category.name}>
                              {category.name}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  </FormItem>
                    )}
                  />
                  <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  disabled={isLoading}
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="men">Man</SelectItem>
                    <SelectItem value="women">Woman</SelectItem>
                    <SelectItem value="unisex">Unisex</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
            <FormField 
            control={form.control}
            name="size"
            render={({field}) => (
              <FormItem>
                <FormLabel>Size</FormLabel>
                <Select 
                  disabled={isLoading}
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue defaultValue={field.value} placeholder="Select a size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sizes.map(size => (
                      <SelectItem key={size.id} value={size.name}>
                        {size.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField 
            control={form.control}
              name="brand"
                render={ ({field}) => (
                <FormItem>
                  <FormLabel>brand</FormLabel>
                      <Select 
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                            defaultValue={field.value}
                            placeholder="Select a brand">
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brands.map(brand => (
                            <SelectItem 
                            key={brand.id} 
                            value={brand.name}>
                              {brand.name}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  </FormItem>
                    )}
                  /><FormField 
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select
                        disabled={isLoading}
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="used">Used</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />                
                  <FormField 
                control={form.control}
                name="color"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <Select 
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue 
                          defaultValue={field.value} placeholder="Select a color" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {colors.map(color => (
                          <SelectItem key={color.id} value={color.value}>
                            {color.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField 
                control={form.control}
                name="isFeatured"
                render={ ({field}) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                  <FormControl>
                    <Checkbox 
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Featured</FormLabel>
                    <FormDescription>
                      This product will be on home screen under featured product
                    </FormDescription>
                  </div>
                  </FormItem>
                    )}
                  />
                  <FormField 
                control={form.control}
                name="isArchived"
                render={ ({field}) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                  <FormControl>
                    <Checkbox 
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Archived</FormLabel>
                    <FormDescription>
                      This product will bot be displayed anywhere inside the store
                    </FormDescription>
                  </div>
                  </FormItem>
                    )}
                  />
            </div>
            <Button disabled={isLoading || !form.formState.isValid} type="submit" size="sm">
            {initialData ? "Save Changes" : "Create Product"}
            </Button>


          </form>
        </Form>
  </>
};
