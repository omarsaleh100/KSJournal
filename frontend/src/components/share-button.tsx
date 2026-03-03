"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 px-3 py-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-all text-sm"
      aria-label="Share this article"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-green-600 font-medium">Link copied!</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </>
      )}
    </button>
  );
}
