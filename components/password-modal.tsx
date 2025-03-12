"use client";

import { Modal } from "@/components/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import bcrypt from "bcryptjs";

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPasswordSubmit: (password: string) => void;
  mode: "create" | "enter";
}

export const PasswordModal = ({ isOpen, onClose, onPasswordSubmit, mode }: PasswordModalProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { userId } = useAuth();

  const handleSubmit = async () => {
    if (mode === "create") {
      if (password !== confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters.");
        return;
      }

      try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await setDoc(doc(db, "users", userId!), { password: hashedPassword }, { merge: true });
        toast.success("Password created successfully!");
        onPasswordSubmit(password);
      } catch (error) {
        console.error("Error saving password:", error);
        toast.error("Failed to create password. Please try again.");
      }
    } else if (mode === "enter") {
      if (!password) {
        toast.error("Please enter your password.");
        return;
      }
      onPasswordSubmit(password);
    }
  };

  return (
    <Modal
      title={mode === "create" ? "Create Your Password" : "Enter Your Password"}
      description={
        mode === "create"
          ? "Please create a password to secure your account."
          : "Please enter your password to access the payment page."
      }
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-4">
        <Input
          type="password"
          placeholder={mode === "create" ? "Create a password" : "Enter your password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="focus:ring-2 focus:ring-blue-500"
        />
        {mode === "create" && (
          <Input
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="focus:ring-2 focus:ring-blue-500"
          />
        )}
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {mode === "create" ? "Create Password" : "Submit"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};