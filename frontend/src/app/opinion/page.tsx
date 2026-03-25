export const dynamic = "force-dynamic";

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
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="border-b border-zinc-900 dark:border-zinc-100 mb-8 pb-2">
          <h1 className="text-3xl font-serif font-bold flex items-center gap-3">
            <Quote className="w-7 h-7 text-red-800 dark:text-red-400" />
            Opinion
          </h1>
        </div>

        <div className="space-y-10">
          {opinions.length > 0 ? (
            opinions.map((op: any, i: number) => (
              <article key={i} className="border-b border-zinc-200 dark:border-zinc-700 pb-10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-widest">
                    Opinion
                  </span>
                </div>

                <Link href={`/article/opinion-${i}-${slugify(op.title)}`} className="group">
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-zinc-900 dark:text-zinc-100 leading-tight group-hover:text-red-800 dark:group-hover:text-red-400 transition-colors mb-3">
                    {op.title}
                  </h2>
                </Link>

                <p className="text-lg text-zinc-600 dark:text-zinc-400 font-serif leading-relaxed mb-4">
                  {op.snippet}
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-600 dark:text-zinc-300">
                    {op.author?.charAt(0) || "?"}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 block">{op.author}</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 italic">{op.role}</span>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="text-zinc-400 dark:text-zinc-500">No opinion pieces available.</p>
          )}
        </div>
      </main>
    </div>
  );
}
