"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import Link from "next/link";

// Define a type for address components
interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

const CompletePage = () => {
  const { userId } = useAuth();
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [identityCard] = useState("");
  const [ghanaCardNumber, setGhanaCardNumber] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  useEffect(() => {
    if (!userId) {
      router.push("/sign-in");
    }
  }, [userId, router]);

  // Fetch user's current location
  const fetchLocation = () => {
    setIsFetchingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyB-PvAvGANptLVY-HtCSDDuKkm4Fq13MJw`
            );
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              const address = data.results[0].formatted_address;
              setLocation(address);
              // Extract city and region from address components
              const cityComponent = data.results[0].address_components.find(
                (component: AddressComponent) =>
                  component.types.includes("locality") ||
                  component.types.includes("administrative_area_level_2")
              );
              const regionComponent = data.results[0].address_components.find(
                (component: AddressComponent) =>
                  component.types.includes("administrative_area_level_1")
              );
              setCity(cityComponent?.long_name || "");
              setRegion(regionComponent?.long_name || "");
            }
          } catch (error) {
            console.error("Error fetching location details:", error);
          } finally {
            setIsFetchingLocation(false);
          }
        },
        (error) => {
          console.error("Error fetching location:", error);
          setIsFetchingLocation(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsFetchingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ghana Card validation
    const ghanaCardRegex = /^GHA\d{9}$/;
    if (!ghanaCardRegex.test(ghanaCardNumber)) {
      alert("Invalid Ghana Card number. Format: GHA followed by 9 digits (e.g., GHA123456789).");
      return;
    }

    // Phone validation for Ghanaian format
    if (!phone.startsWith("+233") || phone.length !== 13) {
      alert("Invalid Ghanaian phone number. Format: +233xxxxxxxxx.");
      return;
    }

    try {
      setLoading(true);
      const userRef = doc(db, "users", userId!);

      // Update user data in Firestore
      await updateDoc(userRef, {
        phone,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        identityCard,
        ghanaCardNumber,
        address: {
          location,
          city,
          region,
        },
        status: "pending",
        updatedAt: serverTimestamp(),
      });

      // Redirect to the pending page
      router.push("/pending?status=pending");
    } catch (err) {
      console.error("Error updating user details:", err);
      alert("Failed to save your details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl"
      >
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Verify Your Account
        </h2>
        <p className="text-lg text-center text-gray-600 mb-6">
          Please provide the required information to verify your account.
        </p>

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="middleName" className="block text-sm font-medium text-gray-700">
              Middle Name (Optional)
            </label>
            <input
              id="middleName"
              type="text"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Address Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={fetchLocation}
              disabled={isFetchingLocation}
              className="mt-2 w-full py-2 px-4 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition duration-300"
            >
              {isFetchingLocation ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                "Use Current Location"
              )}
            </button>
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="region" className="block text-sm font-medium text-gray-700">
              Region
            </label>
            <input
              id="region"
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Other Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number (Ghanaian)
            </label>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+233xxxxxxxxx"
              className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="ghanaCardNumber" className="block text-sm font-medium text-gray-700">
              Ghana Card Number
            </label>
            <input
              id="ghanaCardNumber"
              type="text"
              value={ghanaCardNumber}
              onChange={(e) => setGhanaCardNumber(e.target.value)}
              placeholder="GHA123456789"
              className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 text-white text-lg rounded-lg transition duration-300 ease-in-out transform hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Submit for Verification"}
        </button>

        {/* Terms and Privacy Links */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            By submitting, you agree to our{" "}
            <Link
              href="/terms"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </Link>.
          </p>
        </div>
      </form>
    </div>
  );
};

export default CompletePage;