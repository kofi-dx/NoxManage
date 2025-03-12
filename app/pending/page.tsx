"use client";

import { useAuth } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { db } from "@/lib/firebase"; // Import Firebase
import { doc, getDoc, updateDoc } from "firebase/firestore"; // To fetch and update user data in Firestore
import Link from "next/link";
import notificationService from "@/providers/notification_service"; // Import notification service

// Wrap the main component in Suspense
const PendingPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PendingPageContent />
    </Suspense>
  );
};

// Move the main logic to a separate component
const PendingPageContent = () => {
  const { userId, isLoaded } = useAuth(); // `isLoaded` ensures user data has been fully loaded
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get("status");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // Track if the current user is an admin
  const [userLocation, setUserLocation] = useState<string | null>(null); // Track the user's location

  useEffect(() => {
    // Wait until the user data has been loaded
    if (!isLoaded) return;

    if (!userId) {
      // Redirect to sign-in page if not authenticated
      router.push("/sign-in");
    } else {
      // Fetch the current user's data to check if they are an admin
      const currentUserDocRef = doc(db, "users", userId);
      getDoc(currentUserDocRef).then((currentUserDoc) => {
        if (currentUserDoc.exists()) {
          const currentUserRole = currentUserDoc.data()?.role;
          setIsAdmin(currentUserRole === "admin"); // Set isAdmin based on the user's role
        }
      });

      // If user is authenticated, check the account status
      const userDocRef = doc(db, "users", userId);
      getDoc(userDocRef).then((userDoc) => {
        if (userDoc.exists()) {
          const userStatus = userDoc.data()?.status;

          if (userStatus === "approved") {
            router.push("/dashboard"); // Redirect to dashboard if approved
          } else if (userStatus === "pending") {
            setLoading(false); // Show pending status message
            // Notify the user that their account is under review
            notifyUserPending(userId);
          } else {
            setLoading(false); // Handle other cases like rejected
          }
        } else {
          setLoading(false); // Handle case where user data is not found
        }
      });
    }
  }, [userId, isLoaded, router, status]);

  // Fetch the user's current location
  useEffect(() => {
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
              setUserLocation(locationName);
            })
            .catch((error) => {
              console.error("Error fetching location details:", error);
              setUserLocation("Location not available");
            });
        },
        (error) => {
          console.error("Error fetching location:", error);
          setUserLocation("Location not available");
        }
      );
    } else {
      setUserLocation("Geolocation is not supported by your browser.");
    }
  }, []);

  // Function to notify the user that their account is under review
  const notifyUserPending = async (userId: string) => {
    try {
      const user = await notificationService.getUserById(userId);
      const message = `Dear ${user.first_name}, your account is currently under review. You will receive a call within 48 hours to confirm your details. Thank you for your patience!`;
      await notificationService.sendSMS(user.phone!, message);
      await notificationService.sendEmail(user.email, "Account Under Review", message);
    } catch (error) {
      console.error("Failed to notify user:", error);
    }
  };

  // Function to handle user approval
  const handleApproveUser = async (userId: string) => {
    try {
      await updateDoc(doc(db, "users", userId), { status: "approved" });
      await notificationService.notifyUserApproval(userId); // This will now use the API route
      alert("User approved successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to approve user:", error);
      alert("Failed to approve user. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <p className="text-lg text-gray-500 text-center">Loading status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-4">Account Verification Pending</h2>

        <>
          <p className="text-lg text-gray-700 text-center">
            Your account is currently under review. We will verify your details, including your identity and store information, before approving your account.
          </p>
          <div className="mt-4 text-gray-600 text-sm">
            <p>To ensure the security and legitimacy of both buyers and sellers, we will verify the following:</p>
            <ul className="list-disc pl-5">
              <li>Identity verification with a Ghana Card.</li>
              <li>Confirmation of your store location and the nature of your business.</li>
              <li>Ensuring your store is based in Ghana to guarantee legal compliance and smooth transactions.</li>
            </ul>
            <p className="mt-2">Once verified, you will receive a call to confirm your details, and your account will be fully activated. Thank you for your patience!</p>
          </div>
        </>

        {/* Display the user's current location */}
        {userLocation && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Your current location: <span className="font-medium">{userLocation}</span>
            </p>
          </div>
        )}

        {status === "pending" && (
          <p className="text-lg text-blue-800 text-center">Pending</p>
        )}

        {status === "rejected" && (
          <p className="text-lg text-red-600 text-center">
            Your account has been rejected. Please contact support for more information or help with the approval process.
          </p>
        )}

        {!status && (
          <p className="text-lg text-gray-500 text-center">Loading status...</p>
        )}

        {/* Admin-only approval button */}
        {isAdmin && (
          <div className="mt-6 text-center">
            <button
              onClick={() => handleApproveUser(userId!)}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            >
              Approve User
            </button>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>By using NoxManage, you agree to our <Link href="/terms" className="text-blue-500">Terms & Conditions</Link> and <Link href="/privacy" className="text-blue-500">Privacy Policy</Link>.</p>
        </div>
      </div>
    </div>
  );
};

export default PendingPage;