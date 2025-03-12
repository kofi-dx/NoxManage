"use client";

import Link from "next/link";
import { FaLocationArrow } from "react-icons/fa";
import { Spotlight } from "./components/Spotlight";
import { TextGenerateEffect } from "./components/TextGenerateEffect";
import { MagicButton } from "./components/MagicButton";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[hsl(0,0%,3.9%)] to-[hsl(217.9,10.6%,64.9%)] p-8">
      {/* Spotlight Effects */}
      <div>
        <Spotlight className="-top-40 -left-10 md:-left-32 md:-top-20 h-screen" fill="white" />
        <Spotlight className="top-10 left-full h-[80vh] w-[50vw]" fill="hsl(35.5,91.7%,32.9%)" />
        <Spotlight className="-top-28 left-80 h-[80vh] w-[50vw]" fill="hsl(143.8,61.2%,20.2%)" />
      </div>

      {/* Background Grid */}
      <div className="h-screen w-full dark:bg-[hsl(0,0%,3.9%)] bg-[hsl(0,0%,3.9%)] dark:bg-grid-white/[0.03] bg-grid-white/[0.05] flex items-center justify-center absolute top-0 left-0">
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-[hsl(0,0%,3.9%)] bg-[hsl(0,0%,3.9%)] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      </div>

      {/* Main Content */}
      <div className="flex justify-center relative my-20 z-10">
        <div className="max-w-[89vw] md:max-w-2xl lg:max-w-[60vw] flex flex-col items-center justify-center">
          <h2 className="uppercase tracking-widest text-xs text-center text-[hsl(35.5,91.7%,32.9%)] max-w-80">
            Welcome to NoxManage Store
          </h2>

          {/* Animated Text */}
          <TextGenerateEffect
            className="text-center text-[40px] md:text-5xl lg:text-6xl"
            words="Your Fashion, Your Store, Your Success"
          />

          <p className="text-center md:tracking-wider mb-4 text-sm md:text-lg lg:text-2xl text-[hsl(217.9,10.6%,64.9%)]">
            Sell fashion items like clothes, sneakers, and accessories with ease. Manage your store, track sales, and withdraw securely—all in one place.
          </p>

          {/* Call-to-Action Button */}
          <Link href="/signup">
            <MagicButton
              title="Join NoxManage Today"
              icon={<FaLocationArrow />}
              position="right"
            />
          </Link>
        </div>
      </div>

      {/* Why Choose NoxManage Section */}
      <div className="max-w-5xl mx-auto bg-[hsl(0,0%,3.9%)]/50 p-8 rounded-lg shadow-xl backdrop-blur-sm">
        <h2 className="text-2xl font-semibold text-center text-[hsl(35.5,91.7%,32.9%)] mb-6">
          Why Choose NoxManage?
        </h2>
        <ul className="list-disc pl-6 text-[hsl(217.9,10.6%,64.9%)]">
          <li className="mb-2">
            <strong>Sell Anything Related to Fashion:</strong> From clothes to sneakers, NoxManage is your one-stop shop for fashion sales.
          </li>
          <li className="mb-2">
            <strong>Secure Transactions:</strong> Fast and safe payments with no hidden fees.
          </li>
          <li className="mb-2">
            <strong>Customer-Focused:</strong> We prioritize customer satisfaction and ensure a seamless shopping experience.
          </li>
        </ul>
      </div>

      {/* Seller Validation Process Section */}
      <div className="max-w-5xl mx-auto bg-[hsl(0,0%,3.9%)]/50 p-8 mt-8 rounded-lg shadow-xl backdrop-blur-sm">
        <h2 className="text-2xl font-semibold text-center text-[hsl(35.5,91.7%,32.9%)] mb-4">
          Seller Validation Process
        </h2>
        <p className="text-[hsl(217.9,10.6%,64.9%)]">
          At NoxManage, we prioritize quality and trust. All sellers go through a validation process to ensure a safe and reliable marketplace.
        </p>
        <ul className="list-disc pl-6 mt-4 text-[hsl(217.9,10.6%,64.9%)]">
          <li className="mb-2">Submit your application with the necessary business details.</li>
          <li className="mb-2">Our team reviews your information to verify your business.</li>
          <li className="mb-2">Once validated, you&apos;ll gain full access to your dashboard and can start selling!</li>
        </ul>
      </div>

      {/* Footer Call-to-Action */}
      <div className="text-center mt-8">
        <p className="text-xl font-medium text-[hsl(35.5,91.7%,32.9%)]">
          Ready to start selling?{" "}
          <span className="text-[hsl(143.8,61.2%,20.2%)] font-semibold">
            <Link href="/signup" className="hover:underline">Join NoxManage today!</Link>
          </span>
        </p>
      </div>
    </div>
  );
};

export default HomePage;