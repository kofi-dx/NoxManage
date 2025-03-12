// components/ClientRedirect.tsx
"use client";
import { useEffect } from "react";

const ClientRedirect = ({ status }: { status: string }) => {
  useEffect(() => {
    window.location.href = `/pending?status=${status}`;
  }, [status]);

  return null; // No need to render anything
};

export default ClientRedirect;
