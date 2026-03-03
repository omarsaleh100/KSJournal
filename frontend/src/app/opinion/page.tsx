export const revalidate = 3600;

import { Header } from "@/components/header";
import { Quote } from "lucide-react";
import Link from "next/link";
import { slugify } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

async function getOpinionsData() {
  const snap = await getDoc(doc(db, "daily_edition", "opinions"));
  return snap.exists() ? snap.data()?.items || [] : [];
}

export default async function OpinionPage() {
  const opinions = await getOpinionsData();

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="border-b border-zinc-900 mb-8 pb-2">
          <h1 className="text-3xl font-serif font-bold flex items-center gap-3">
            <Quote className="w-7 h-7 text-red-800" />
            Opinion
          </h1>
        </div>

        <div className="space-y-10">
          {opinions.length > 0 ? (
            opinions.map((op: any, i: number) => (
              <article key={i} className="border-b border-zinc-200 pb-10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-bold text-red-700 uppercase tracking-widest">
                    Opinion
                  </span>
                </div>

                <Link href={`/article/opinion-${i}-${slugify(op.title)}`} className="group">
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-zinc-900 leading-tight group-hover:text-red-800 transition-colors mb-3">
                    {op.title}
                  </h2>
                </Link>

                <p className="text-lg text-zinc-600 font-serif leading-relaxed mb-4">
                  {op.snippet}
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600">
                    {op.author?.charAt(0) || "?"}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-zinc-900 block">{op.author}</span>
                    <span className="text-xs text-zinc-500 italic">{op.role}</span>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="text-zinc-400">No opinion pieces available.</p>
          )}
        </div>
      </main>
    </div>
  );
}
