export const dynamic = "force-dynamic";

import { Header } from "@/components/header";
import { NewsCard } from "@/components/news-card";
import { BarChart3, TrendingUp } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { slugify } from "@/lib/utils";

const MARKET_CATEGORIES = ["Markets", "Economy", "Banking", "Energy", "Tech"];

async function getMarketsData() {
  const [deepDiveSnap, tickerSnap, featuredSnap] = await Promise.all([
    getDoc(doc(db, "daily_edition", "deep_dive")),
    getDoc(doc(db, "system", "market_ticker")),
    getDoc(doc(db, "daily_edition", "featured_stories")),
  ]);

  const allFeatured = featuredSnap.exists() ? featuredSnap.data()?.items || [] : [];
  const marketStories = allFeatured
    .map((s: any, i: number) => ({ ...s, originalIndex: i }))
    .filter((s: any) => MARKET_CATEGORIES.includes(s.category));

  return {
    deepDiveData: deepDiveSnap.exists() ? deepDiveSnap.data() : null,
    tickerData: tickerSnap.exists() ? tickerSnap.data()?.items || [] : [],
    marketStories,
  };
}

export default async function MarketsPage() {
  const { deepDiveData, tickerData, marketStories } = await getMarketsData();

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="border-b border-zinc-900 dark:border-zinc-100 mb-8 pb-2">
          <h1 className="text-3xl font-serif font-bold flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-red-800 dark:text-red-400" />
            Markets
          </h1>
        </div>

        {/* Ticker Strip */}
        {tickerData.length > 0 && (
          <div className="flex gap-6 overflow-x-auto pb-4 mb-10 border-b border-zinc-200 dark:border-zinc-700">
            {tickerData.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-sm whitespace-nowrap">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{item.symbol}</span>
                <span className="text-zinc-600 dark:text-zinc-400">{item.price}</span>
                <span className={item.change?.startsWith("-") ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}>
                  {item.change}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Deep Dive */}
        {deepDiveData && (
          <section className="bg-zinc-900 text-zinc-50 -mx-4 px-4 py-12 mb-12 rounded-sm">
            <div className="container mx-auto">
              <div className="flex items-center justify-between mb-8 border-b border-zinc-700 pb-4">
                <h2 className="text-xl font-bold uppercase tracking-widest text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-red-500" /> Market Deep Dive
                </h2>
                <span className="text-xs text-zinc-400">Analysis provided by AI Economist</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {deepDiveData.cards?.map((card: any, idx: number) => (
                  <div key={idx} className={`border-t-2 ${idx === 0 ? "border-red-700" : "border-zinc-700"} pt-4`}>
                    <h3 className="text-lg font-serif font-bold mb-2 text-white">{card.title}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed mb-4">{card.analysis}</p>
                    <Link href={`/article/deep-dive-${idx}-${slugify(card.title)}`} className="text-xs font-bold text-zinc-500 uppercase hover:text-red-500 transition-colors">
                      Read Analysis →
                    </Link>
                  </div>
                ))}
                {deepDiveData.stat && (
                  <div className="bg-zinc-800 p-6 flex flex-col justify-center items-center text-center">
                    <span className="text-4xl font-bold text-white mb-2">{deepDiveData.stat.value}</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">{deepDiveData.stat.label}</span>
                    <span className="text-[10px] text-zinc-500 mt-2">{deepDiveData.stat.source}</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Market-Related Stories */}
        {marketStories.length > 0 && (
          <section>
            <h2 className="text-lg font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100 mb-6 border-b border-zinc-200 dark:border-zinc-700 pb-2">
              Related Stories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketStories.map((story: any, i: number) => (
                <NewsCard
                  key={i}
                  id={`featured-${story.originalIndex ?? i}-${slugify(story.title)}`}
                  category={story.category}
                  title={story.title}
                  summary={story.summary}
                  date={story.date || ""}
                  author={story.author || "Staff"}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
