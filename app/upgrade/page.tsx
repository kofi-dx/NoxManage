"use client";

import { useState } from "react"; 
import { useRouter } from "next/navigation"; 
import { useUser } from "@clerk/nextjs"; // Import Clerk Auth hook 
import { SubscriptionCard } from "@/components/subscriptioncard"; 
import toast from "react-hot-toast"; 

const UpgradePage = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useUser(); // Fetch the user object from Clerk
  const email = user?.primaryEmailAddress?.emailAddress; // Get the authenticated user's email

  // Handle the subscription process
  const handleSubscribe = async (planName: string, price: number, planId: string) => {
    if (!email) {
      toast.error("Email not available. Please log in again.");
      return;
    }

    setLoading(true);

    console.log("Plan ID passed:", planId); // Log to check planId value

    try {
      const response = await fetch("/api/paystack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, plan: planName }), // Send the plan and email to the API
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Redirecting to Paystack URL:", data.data.authorization_url); // Log Paystack URL
        window.location.href = data.data.authorization_url; // Redirect to Paystack for payment
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
      {/* Close or Navigate Back Button */}
      

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
          {/* Free Plan Card */}
          <SubscriptionCard
            title="Free Plan"
            price="GHS 0"
            features={["Access to Dashboard", "1 Store"]}
            onSubscribe={() => alert("Free plan does not require payment.")}
          />
          {/* Basic Plan Card */}
          <SubscriptionCard
            title="Basic Plan"
            price="GHS 149/year"
            features={["Add 2-3 Stores", "Yearly Subscription"]}
            onSubscribe={() => handleSubscribe("Basic", 149, "PLN_phfytznvfdgb4gg")}
          />
          {/* Premium Plan Card */}
          <SubscriptionCard
            title="Premium Plan"
            price="GHS 269/year"
            features={["Add 4-9 Stores", "Yearly Subscription"]}
            onSubscribe={() => handleSubscribe("Premium", 269, "PLN_bgfnzed9mu0blzw")}
          />
        </div>
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/upgrade/about")}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
          >
            Learn More About Subscriptions
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradePage;
