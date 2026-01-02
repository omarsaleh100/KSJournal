"use client";

import { useEffect, useState } from "react";

export function CurrentDate() {
  const [dateStr, setDateStr] = useState<string>("");

  useEffect(() => {
    // This runs only on the client, preventing server mismatch errors
    setDateStr(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  // Return a stable placeholder (or null) during server render
  if (!dateStr) return <span className="opacity-0">Loading Date...</span>;

  return <span>{dateStr}</span>;
}