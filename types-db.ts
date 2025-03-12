import { FieldValue, Timestamp, } from "firebase/firestore";

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  middle_name?: string; 
  address?: {
    city: string;
    location: Location;
    region: string;
  }; 
  identityCard: string;
  tin: string;
  phone?: string | undefined;
  email: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  storeRef: string[];
  transactions?: Withdraw[];
  billingInfo: {
    name: string;
    subAccountCode?: string;
    paymentProvider?: string; 
  };
  subscription: {
    isActive: boolean;
    allowedStores: number;
    planId: string;
    price: number;
    renewalDate?: Timestamp | FieldValue;
  };
  paymentHistory?: Payment[]; 
}
 
export interface Location {
  latitude: number;
  longitude: number;
  address?: string; // Optional address field
}

export interface Store {
  id: string;
  name: string;
  userId: string; // Owner of the store
  image: string;
  phone: string;
  createdAt: string | Timestamp | null; // Use string for serialization
  updatedAt: string | Timestamp | null; // Use string for serialization
  productRefs: string[]; // Array of product IDs
  subscription: {
    isActive: boolean;
    allowedProduct: number; // Add this property to track product limit
    planId: string;
    price: number;
    renewalDate?: string | null; // Use string for serialization
  };
  subaccount_code?: string; // Associated Paystack subaccount code
  amount: string;
  categoryRefs: string[];
  transactions?: Withdraw[];
  location: Location;
  city: string;
  region: "Ghana";
}

export interface Withdraw {
  userId: string;
  storeId: string;
  amount: number;
  tax: string;
  momoProvider: string;
  momoNumber: string;
  reference: string;
  recipient: {
    name: string;
    account_number: string;
    bank_code: string;
  };
  paymentMethod: string;
  status: string;
  reason: string;
  createdAt: Timestamp | FieldValue;
}

export interface Payment {
  storeId: string[];
  id: string;
  userId: string; // Reference to the User
  paymentMethod: "bank" | "momo"; // Payment method used
  paymentProvider: "paystack"; // Assuming Paystack for now
  amount: number; // Payment amount
  status: "pending" | "completed" | "failed"; // Payment status
  transactionId: string; // Paystack or custom transaction ID
  paymentDetails: {
    bankCode?: string;
    accountNumber?: string;
    accountName?: string;
    momoProvider?: string;
    momoNumber?: string;
  };
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  reference?: string[];
}

export interface Product {
  id: string;
  storeRef: string;
  name: string;
  descriptions: string;
  price: number;
  newPrice: number;
  discountPercentage: number;
  qty: number;
  images: { url: string }[];
  isFeatured?: boolean;
  isArchived?: boolean;
  isActive: false
  type: "men" | "women" | "unisex";
  category: string;
  size: string; // Array of Size IDs
  color: string;
  brand: string;
  subAccountCode?: string;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  startDate?: Timestamp | FieldValue;
  endDate?: Timestamp | FieldValue;
  condition: "new" | "used";
}

export type OrderStatus = "Pending" | "Delivering" | "Delivered" | "Failed";

export interface Order {
    id: string; 
    isPaid: boolean; 
    paymentProvider: "paystack"; 
    paymentReference: string; 
    clientName: string; 
    phone: string; 
    products: Product[]; 
    address: string; 
    region: string; 
    city: string; 
    additionalNotes?: string; 
    order_status: OrderStatus; 
    clientId: string; 
    storeOwnerId: string;
    amount: string;
    createdAt: Timestamp | FieldValue | Date; 
    updatedAt?: Timestamp | FieldValue | Date; 
}

export interface Offer {
  id: string;
  storeId: string; // Links offer to a specific store
  title: string;
  description: string; // e.g., "Christmas Sale"
  discountPercentage: number; // e.g., 20
  startDate: Timestamp | FieldValue | undefined;
  endDate: Timestamp | FieldValue | undefined;
  isActive: boolean;
  products: string[]; // Array of product IDs from the store
  createdAt: Timestamp | FieldValue;
}

export interface Banner {
  id: string;
  label: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  storeId: string;
}

export interface Category {
  id: string;
  storeRef: string; // Links category to a specific store
  name: string; // e.g., "Running Shoes", "Casual Sneakers"
  bannerLabel: string; // Optional association with a banner
  bannerId: string;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

export interface Size {
  id: string;
  name: string; // e.g., "US 10", "EU 44"
  value: string; 
  createdAt: Timestamp;
}

export interface Color {
  createdAt: string;
  id: string;
  name: string; // e.g., "Red", "Blue"
  value: string; // Hex code or other representation
}

export interface Brand {
  id: string;
  storeId: string; // Links brand to a specific store
  name: string; // e.g., "Nike", "Adidas"
  value: string;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

