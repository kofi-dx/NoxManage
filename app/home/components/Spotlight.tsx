"use client";

import React, { useEffect, useRef } from "react";

export const Spotlight = ({ className, fill }: { className?: string; fill?: string }) => {
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (spotlightRef.current) {
        spotlightRef.current.style.left = `${e.clientX}px`;
        spotlightRef.current.style.top = `${e.clientY}px`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={spotlightRef}
      className={`absolute w-[300px] h-[300px] rounded-full pointer-events-none opacity-50 blur-3xl ${className}`}
      style={{ backgroundColor: fill }}
    />
  );
};