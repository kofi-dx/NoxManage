"use client";

import { useState } from "react"; 
import { useParams,  } from "next/navigation"; // Import useRouter
import { useUser } from "@clerk/nextjs"; // Import Clerk Auth hook
import { SubscriptionCard } from "@/components/subscriptioncard"; // Assuming you have a SubscriptionCard component
import toast from "react-hot-toast";

const UpgradeProductPage = () => {
  const [loading, setLoading] = useState(false);
  const params = useParams(); // Get storeId from URL params
  const { user } = useUser(); // Fetch the user object from Clerk
  const email = user?.primaryEmailAddress?.emailAddress; // Get the authenticated user's email

  // Plan IDs from environment variables
  const planIds: { [key: string]: string | undefined } = {
    "33 Products Plan": process.env.NEXT_PUBLIC_PAYSTACK_PRODUCT_33,
    "73 Products Plan": process.env.NEXT_PUBLIC_PAYSTACK_PRODUCT_73,
    "183 Products Plan": process.env.NEXT_PUBLIC_PAYSTACK_PRODUCT_183,
  };

  // Handle the subscription process
  const handleSubscribe = async (planName: string) => {
    const planId = planIds[planName];
    if (!planId) {
      console.error(`Plan ID for ${planName} is missing. Ensure that the environment variables are properly set.`);
      toast.error(`Plan ID for ${planName} is not configured. Please contact support.`);
      return;
    }

    if (!email) {
      toast.error("Email not available. Please log in again.");
      return;
    }

    if (!params.storeId) {
      toast.error("Store ID is missing. Please ensure the store ID is in the URL.");
      return;
    }

    setLoading(true);

    console.log("Plan ID passed:", planId); // Log to check planId value

    try {
      const response = await fetch(`/api/${params.storeId}/sub`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          plan: planName, 
          storeId: params.storeId 
        }), // Pass the storeId here
      });       

      const data = await response.json();

      if (response.ok) {
        console.log("Redirecting to Paystack URL:", data.data.authorization_url); // Log Paystack URL
        window.location.href = data.data.authorization_url; // Redirect to Paystack for payment

        // After successful payment, the user will be redirected back to the redirectUrl
        // Ensure your Paystack webhook handles the redirectUrl properly
      } else {
        const errorMessage = data.error || data.message || "Payment initialization failed.";
        console.error("Error:", errorMessage);
        toast.error(errorMessage); // Show error message on failure
      }
    } catch (error) {
      console.error("Error during payment initialization:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 py-12 relative">
      <div className="max-w-4xl w-full px-4 ">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">
          Choose Your Subscription Plan
        </h2>
        {/* Prefill the email field with the user's email */}
        <input
          type="email"
          value={email || ""}
          readOnly
          className="mb-4 p-2 border border-gray-300 rounded w-full bg-gray-200 cursor-not-allowed"
        />
        <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8">
          {/* 33 Products Plan (69 GHS) */}
          <SubscriptionCard
            title="33 Products Plan"
            price="GHS 69/year"
            features={["Add up to 33 Products", "Yearly Subscription"]}
            onSubscribe={() => handleSubscribe("33 Products Plan")} // Removed price here
          />
          {/* 73 Products Plan (159 GHS) */}
          <SubscriptionCard
            title="73 Products Plan"
            price="GHS 159/year"
            features={["Add up to 73 Products", "Yearly Subscription"]}
            onSubscribe={() => handleSubscribe("73 Products Plan")} // Removed price here
          />
          {/* 183 Products Plan (250 GHS) */}
          <SubscriptionCard
            title="183 Products Plan"
            price="GHS 250/year"
            features={["Add up to 183 Products", "Yearly Subscription"]}
            onSubscribe={() => handleSubscribe("183 Products Plan")} // Removed price here
          />
        </div>
        <div className="mt-8 text-center">
          <button
            className={`bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Processing..." : "Proceed to Payment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeProductPage;