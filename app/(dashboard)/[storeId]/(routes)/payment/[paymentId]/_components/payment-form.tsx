"use client";

import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, Timestamp, updateDoc } from "firebase/firestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Payment } from "@/types-db";

export const revalidate = 0;

const paymentFormSchema = z.object({
  paymentMethod: z.enum(["momo"], { invalid_type_error: "Please select a valid payment method" }), // Only "momo" is allowed
  momoProvider: z.string().optional(),
  momoNumber: z.string().optional(),
  accountName: z.string().min(3, "Account Name is required").optional(),
  businessName: z.string().min(3, "Business Name is required"),
  vendorEmail: z.string().email("Invalid email address"),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;
type PaymentFormProps = {
  initialData: Payment | null; // Accept initialData as a prop
};

const PaymentForm: React.FC<PaymentFormProps> = ({ initialData }) => {
  // Transform initialData to match PaymentFormValues
  const transformedInitialData = initialData
    ? {
        ...initialData,
        paymentMethod: initialData.paymentMethod === "bank" ? "momo" : initialData.paymentMethod, // Convert "bank" to "momo"
      }
    : null;

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: transformedInitialData || {
      paymentMethod: "momo", // Default to "momo"
      momoProvider: "",
      momoNumber: "",
      accountName: "",
      businessName: "",
      vendorEmail: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<Payment[] | null>(null);
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (isSignedIn && user) {
        try {
          const userRef = doc(db, "users", user.id);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setPaymentHistory(userData.paymentHistory || []);
  
            // Check if storeRef exists and is an array
            const stores = userData?.storeRef || [];
            if (Array.isArray(stores) && stores.length > 0) {
              setStoreId(stores[0].id);
            } else {
              toast.error("No stores found for this user.");
            }
          }
        } catch (error) {
          console.error("Error fetching payment history:", error);
          toast.error("Failed to fetch payment history.");
        }
      }
    };
  
    fetchPaymentHistory();
  }, [isSignedIn, user]);

  useEffect(() => {
    // Redirect if payment history exists
    if (paymentHistory && paymentHistory.length > 0) {
      const firstPayment = paymentHistory[0];
      
      // Check if createdAt is a Firestore Timestamp
      if (firstPayment.createdAt instanceof Timestamp) {
        const firstPaymentDate = firstPayment.createdAt.toDate(); // Convert Timestamp to JavaScript Date
        const now = new Date();
        const thirtyDaysLater = new Date(firstPaymentDate);
        thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
  
        // Redirect to payment page if more than 30 days have not passed
        if (now < thirtyDaysLater) {
          router.push(`/${storeId}/payment`);
        }
      }
    }
  }, [paymentHistory, storeId, router]);
  

  const onSubmit = async (values: PaymentFormValues) => {
    if (!isSignedIn) {
      toast.error("You need to be signed in to update your payment details.");
      return;
    }

    if (!storeId) {
      toast.error("Store ID is required.");
      return;
    }

    try {
      setIsLoading(true);

      const userId = user?.id;

      if (!userId) {
        toast.error("Failed to retrieve user ID.");
        return;
      }

      console.log("Submitting data:", { ...values, storeId, userId });

      // Create Subaccount
      const response = await axios.post("/api/create-subaccount", {
        ...values,
        storeId,
        userId,
      });

      console.log("Subaccount creation response:", response.data);

      if (response.data?.subaccount_code) {
        // Update the store with the subaccount_code
        const storeRef = doc(db, "stores", storeId);
        await updateDoc(storeRef, {
          subaccount_code: response.data.subaccount_code,
        });

        toast.success("Payment details saved successfully");

        // Redirect to the payment page after successful submission
        router.push(`/${storeId}/payment`);
      } else {
        toast.error("Failed to create subaccount. Please try again.");
      }
    } catch (error) {
      console.error("Error updating payment info:", error);
      toast.error("Failed to update payment info. Please try again.");
    } finally {
      setIsLoading(false);
      window.location.reload();
    }
  };


  return (
    <div className="p-8 space-y-6">
      <h2 className="text-xl font-semibold">Payment Settings</h2>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Payment Method" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Only "momo" is available */}
                        <SelectItem value="momo">Mobile Money</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* MoMo Fields */}
            <FormField
              control={form.control}
              name="momoProvider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>MoMo Provider</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="e.g., MTN, AirtelTigo, Telcel"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="momoNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>MoMo Number</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Enter your MoMo number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Account Name */}
            <FormField
              control={form.control}
              name="accountName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Account holder's name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Business Name */}
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Your registered business name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Vendor Email */}
            <FormField
              control={form.control}
              name="vendorEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor Email</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Your email address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default PaymentForm;