// pages/privacy.tsx
"use client";

import React from "react";
import Link from "next/link";

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl w-full">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Privacy Policy</h1>

        <section className="text-gray-700 mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="mb-4">
            This Privacy Policy outlines how NoxManage collects, uses, and protects your personal data. By using our platform, you agree to the collection and use of your information as described in this policy.
          </p>
        </section>

        <section className="text-gray-700 mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
          <p className="mb-4">
            We collect personal information such as your name, email address, phone number, and other necessary details to process transactions and improve our services.
          </p>
        </section>

        <section className="text-gray-700 mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
          <p className="mb-4">
            Your personal information is used to provide our services, verify your account, process payments, and communicate with you regarding your account and orders.
          </p>
        </section>

        <section className="text-gray-700 mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
          <p className="mb-4">
            We employ various security measures to protect your data from unauthorized access, alteration, and destruction.
          </p>
        </section>

        <section className="text-gray-700 mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Changes to This Policy</h2>
          <p className="mb-4">
          NoxManage reserves the right to update this Privacy Policy at any time. We will notify users of any significant changes via email or by posting the updated policy on our platform.
          </p>
        </section>

        <div className="text-center mt-8">
          <Link href="/pending" className="text-blue-500 hover:text-blue-700 text-sm underline">
            Back to Pending
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
