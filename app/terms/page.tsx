"use client";

import Link from "next/link";
 
const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Terms and Conditions</h2>

        <section className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700">1. Introduction</h3>
          <p className="text-gray-600">
            Welcome to NoxManage. By accessing or using our platform, you agree to comply with and be bound by these Terms and Conditions, which govern your use of NoxManage services. If you do not agree with any part of these terms, you must not use our platform.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700">2. Account Registration</h3>
          <p className="text-gray-600">
            To access certain features on NoxManage, you must create an account. You are responsible for maintaining the confidentiality of your account information and for all activities under your account. You must notify us immediately if you believe your account has been compromised.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700">3. Seller Obligations</h3>
          <p className="text-gray-600">
            As a seller on NoxManage, you agree to provide accurate, complete, and lawful information about your products. You are responsible for the quality, legality, and pricing of the products you sell. NoxManage reserves the right to remove listings that violate our policies.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700">4. Buyer Obligations</h3>
          <p className="text-gray-600">
            As a buyer, you agree to pay for products purchased in accordance with the pricing and payment terms established by the seller. You are responsible for providing accurate information regarding payment and shipping details.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700">5. Payment and Fees</h3>
          <p className="text-gray-600">
          NoxManage charges a commission fee on transactions completed through our platform. All payments must be made through our secure payment gateway. By using our payment system, you agree to comply with our payment terms.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700">6. Privacy and Data Security</h3>
          <p className="text-gray-600">
            We value your privacy and are committed to protecting your personal data. For more information on how we collect, use, and protect your information, please refer to our <Link href="/privacy" className="text-blue-500">Privacy Policy</Link>.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700">7. Limitation of Liability</h3>
          <p className="text-gray-600">
          NoxManage is not responsible for any damages or losses incurred as a result of using our platform, including but not limited to product issues, fraud, or disputes between buyers and sellers. We act solely as a platform to connect buyers and sellers.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700">8. Termination</h3>
          <p className="text-gray-600">
            We may suspend or terminate your access to NoxManage at any time, with or without cause, if we believe you have violated our terms or engaged in fraudulent activity. You may also terminate your account at any time by contacting us.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700">9. Changes to Terms</h3>
          <p className="text-gray-600">
          NoxManage reserves the right to modify or update these Terms and Conditions at any time. We will notify users of significant changes through email or a notification on our platform. Continued use of our platform after such changes constitutes your acceptance of the updated terms.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700">10. Governing Law</h3>
          <p className="text-gray-600">
            These Terms and Conditions are governed by the laws of Ghana. Any disputes arising from the use of NoxManage will be resolved in accordance with the relevant laws of Ghana.
          </p>
        </section>

        <div className="mt-8 text-center">
        <Link href="/pending" className="text-blue-500 hover:text-blue-700 text-sm underline">
            Back to Pending
        </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
