"use client";

import { Modal } from "@/components/modal";
import { useStoreModal } from "@/hooks/use-store-modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(4, { message: "Store name should be at least 4 characters" }),
  location: z.string().min(1, { message: "Location is required" }),
  city: z.string().min(1, { message: "City is required" }),
  region: z.string().min(1, { message: "Region is required" }),
  phone: z.string().min(1, { message: "Phone is required" }),
});

export const StoreModal = () => {
  const storeModal = useStoreModal();
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      location: "",
      city: "",
      region: "",
      phone: "",
    },
  });

  // Fetch the user's current location using GPS
  const fetchLocation = () => {
    setIsFetchingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Use a reverse geocoding API to get the location name
          fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          )
            .then((response) => response.json())
            .then((data) => {
              const locationName = `${data.locality}, ${data.city}, ${data.countryName}`;
              form.setValue("location", locationName);
              form.setValue("city", data.city || "");
              form.setValue("region", data.principalSubdivision || "");
              setIsFetchingLocation(false);
            })
            .catch((error) => {
              console.error("Error fetching location details:", error);
              toast.error("Failed to fetch location details.");
              setIsFetchingLocation(false);
            });
        },
        (error) => {
          console.error("Error fetching location:", error);
          toast.error("Failed to fetch location. Please enable location services.");
          setIsFetchingLocation(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
      setIsFetchingLocation(false);
    }
  };

  const handleCancel = async () => {
    storeModal.onClose();
    if (user?.id) {
      try {
        const response = await axios.get(`/api/stores`);
        const stores = response.data;

        if (stores.length > 0) {
          router.push(`/${stores[0].id}`);
        } else {
          console.log("No stores found.");
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/stores", values);
      toast.success("Store created successfully!");
      window.location.assign(`/${response.data.id}`);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Create a new store"
      description="Add a new store to manage your products and categories."
      isOpen={storeModal.isOpen}
      onClose={storeModal.onClose}
    >
      <div className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Store Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Enter your store name..."
                      {...field}
                      className="focus:ring-2 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input
                        disabled={isLoading || isFetchingLocation}
                        placeholder="Enter your store location..."
                        {...field}
                        className="focus:ring-2 focus:ring-blue-500"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      onClick={fetchLocation}
                      disabled={isFetchingLocation}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      {isFetchingLocation ? "Fetching..." : "Use GPS"}
                    </Button>
                  </div>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            {/* City and Region in Columns */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Enter your store city..."
                        {...field}
                        className="focus:ring-2 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Enter your store region..."
                        {...field}
                        className="focus:ring-2 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />
            </div>

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Enter your store phone..."
                      {...field}
                      className="focus:ring-2 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                disabled={isLoading}
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                disabled={isLoading}
                type="submit"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? "Creating..." : "Create Store"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Modal>
  );
};