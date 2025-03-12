"use client";

import React, { useEffect, useState } from "react";

export const TextGenerateEffect = ({ words, className }: { words: string; className?: string }) => {
  const [text, setText] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(words.slice(0, i));
      i++;
      if (i > words.length) clearInterval(interval);
    }, 50);

    return () => clearInterval(interval);
  }, [words]);

  return <h1 className={`font-bold ${className}`}>{text}</h1>;
};