import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import bcrypt from "bcryptjs";
import { db } from "./firebase";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatter = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
});

export const customFormatter = (value: number) => {
  return formatter.format(value).replace("GH₵", "₵");
};

export const calculateDiscountedPrice = (originalPrice: number, discountPercentage: number): number => {
  if (discountPercentage < 0 || discountPercentage > 100) {
    throw new Error("Invalid discount percentage. It should be between 0 and 100.");
  }
  return originalPrice - (originalPrice * discountPercentage) / 100;
};

export const convertTimestampToDateString = (timestamp: unknown): string => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  return "";
};

export const formatNumber = (value: number): string => {
  if (value >= 1_000_000_000) {
    const formatted = value / 1_000_000_000;
    return `${formatted % 1 === 0 ? formatted.toFixed(0) : formatted.toFixed(1)}B`;
  } else if (value >= 1_000_000) {
    const formatted = value / 1_000_000;
    return `${formatted % 1 === 0 ? formatted.toFixed(0) : formatted.toFixed(1)}M`;
  } else if (value >= 1_000) {
    const formatted = value / 1_000;
    return `${formatted % 1 === 0 ? formatted.toFixed(0) : formatted.toFixed(1)}k`;
  } else {
    return value.toString();
  }
};

export const validatePassword = async (userId: string, enteredPassword: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      const storedPassword = userDoc.data().password;
      return await bcrypt.compare(enteredPassword, storedPassword);
    }
    return false;
  } catch (error) {
    console.error("Error validating password:", error);
    return false;
  }
};

export const convertToPlainObject = <T>(data: T): T => {
  if (data === null || typeof data !== "object") {
    return data;
  }

  if (data instanceof Timestamp) {
    return data.toDate().toISOString() as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => convertToPlainObject(item)) as T;
  }

  const plainObject: { [key: string]: unknown } = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      plainObject[key] = convertToPlainObject(data[key]);
    }
  }

  return plainObject as T;
};

export const convertTimestampToISOString = (timestamp?: Timestamp): string | null => {
  return timestamp?.toDate()?.toISOString() || null;
};