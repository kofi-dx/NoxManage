"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { PasswordModal } from "@/components/password-modal";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { validatePassword } from "@/lib/utils";

export const MainNav = ({}: React.HTMLAttributes<HTMLElement>) => {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordMode, setPasswordMode] = useState<"create" | "enter">("enter");
  const { userId } = useAuth();

    const routes = [
        {
            href : `/${params.storeId}`,
            label : "Overview",
            active : pathname === `/${params.storeId}`
        },
        {
            href : `/${params.storeId}/banners`,
            label : "Banners",
            active : pathname === `/${params.storeId}/banners`
        },
        {
            href : `/${params.storeId}/categories`,
            label : "Categories",
            active : pathname === `/${params.storeId}/categories`
        },
        {
            href : `/${params.storeId}/brands`,
            label : "Brands",
            active : pathname === `/${params.storeId}/brands`
        },
        {
            href : `/${params.storeId}/products`,
            label : "Products",
            active : pathname === `/${params.storeId}/products`
        },
        {
            href : `/${params.storeId}/orders`,
            label : "Orders",
            active : pathname === `/${params.storeId}/orders`
        },
        {
            href : `/${params.storeId}/settings`,
            label : "settings",
            active : pathname === `/${params.storeId}/settings`
        },
        {
            href : `/${params.storeId}/payment`,
            label : "Payment",
            active : pathname === `/${params.storeId}/payment`
        },
   ];

   const handlePaymentClick = async (e: React.MouseEvent, href: string) => {
    if (href.includes("payment")) {
      e.preventDefault();

      if (userId) {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists() && userDoc.data().password) {
          setPasswordMode("enter");
        } else {
          setPasswordMode("create");
        }
        setIsPasswordModalOpen(true);
      }
    }
  };

  const handlePasswordSubmit = async (password: string) => {
    if (passwordMode === "enter") {
      const isValid = await validatePassword(userId!, password);
      if (isValid) {
        setIsPasswordModalOpen(false);
        router.push(`/${params.storeId}/payment`);
      } else {
        toast.error("Invalid password. Please try again.");
      }
    } else if (passwordMode === "create") {
      setIsPasswordModalOpen(false);
      router.push(`/${params.storeId}/payment`);
    }
  };

  return (
    <>
      <nav className={cn("flex items-center space-x-4 lg:space-x-6 pl-6")}>
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            onClick={(e) => handlePaymentClick(e, route.href)}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              route.active ? "text-black dark:text-white" : "text-muted-foreground"
            )}
          >
            {route.label}
          </Link>
        ))}
      </nav>

      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onPasswordSubmit={handlePasswordSubmit}
        mode={passwordMode}
      />
    </>
  );
};