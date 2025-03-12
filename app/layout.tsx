import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ModalProvider } from "@/providers/modal-provider";
import { ToasterProvider } from "@/providers/toast-provider";


const poppins = Poppins({
  subsets: ["latin"], 
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
})

export const metadata: Metadata = {
  title: "Nox Manage",
  description: "Your Store, Your Way",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider >
      <html lang="en">
      <body
        className={`${poppins.className} antialiased`}
      >
        <ModalProvider />
        <ToasterProvider />
        {children}
      </body>
    </html>
    </ClerkProvider>
  );
}
