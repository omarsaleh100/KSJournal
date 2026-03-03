"use client";

import { useState } from "react";

interface SafeImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

export function SafeImage({ src, alt, className = "", fallbackClassName = "" }: SafeImageProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className={`flex items-center justify-center bg-zinc-100 text-zinc-400 ${fallbackClassName || className}`}>
        <span className="text-xs font-mono uppercase tracking-wider">No Image</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}
