import React from "react";

interface SubscriptionCardProps {
  title: string;
  price: string;
  features: string[];
  onSubscribe: () => void;
  loading?: boolean; // Optional loading state
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  title,
  price,
  features,
  onSubscribe,
  loading = false, // Default to false if not provided
}) => {
  return (
    <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-md">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
      <p className="text-2xl font-bold text-gray-800 mb-4">{price}</p>
      <ul className="mb-6">
        {features.map((feature, index) => (
          <li key={index} className="text-gray-600 mb-2">
            - {feature}
          </li>
        ))}
      </ul>
      <button
        onClick={onSubscribe}
        className={`bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={loading}
        aria-label={`Subscribe to ${title} plan`}
      >
        {loading ? "Processing..." : "Subscribe"}
      </button>
    </div>
  );
};
