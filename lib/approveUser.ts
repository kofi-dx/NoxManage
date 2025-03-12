import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

/**
 * Approves a user and updates their status in Firestore.
 * @param userId - The ID of the user to approve.
 */
export async function approveUser(userId: string) {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      status: "approved",
      "subscription.isActive": true, // Activate subscription upon approval
      updatedAt: serverTimestamp(),
    });
    console.log(`User ${userId} approved successfully`);
  } catch (err) {
    console.error("Error approving user:", err);
  }
}
