"use client";

import { useState, useEffect } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");
      await addDoc(collection(db, "subscribers"), {
        email,
        subscribedAt: serverTimestamp(),
      });
      setStatus("success");
      setEmail("");
    } catch (err) {
      console.error("Subscribe error:", err);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-4">
        <p className="text-sm font-bold text-zinc-900">You&apos;re subscribed!</p>
        <p className="text-xs text-zinc-500 mt-1">Check your inbox tomorrow morning.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        className="w-full px-3 py-2 text-sm border border-zinc-300 mb-2 focus:outline-none focus:border-red-800"
        required
        disabled={status === "loading"}
      />
      <button
        type="submit"
        disabled={!mounted || status === "loading"}
        className="w-full bg-zinc-900 text-white text-sm font-bold py-2 uppercase tracking-wider hover:bg-red-800 transition-colors disabled:opacity-50"
      >
        {status === "loading" ? "Subscribing..." : "Subscribe"}
      </button>
      {status === "error" && (
        <p className="text-xs text-red-600 mt-1">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}
