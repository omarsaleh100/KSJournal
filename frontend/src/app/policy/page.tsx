export const dynamic = "force-dynamic";

import { Header } from "@/components/header";
import { NewsCard } from "@/components/news-card";
import { TrendingUp } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { slugify } from "@/lib/utils";

const POLICY_CATEGORIES = ["Policy", "Global Trade"];

async function getPolicyData() {
  const [globalSnap, featuredSnap] = await Promise.all([
    getDoc(doc(db, "daily_edition", "global_briefing")),
    getDoc(doc(db, "daily_edition", "featured_stories")),
  ]);

  const allFeatured = featuredSnap.exists() ? featuredSnap.data()?.items || [] : [];
  const policyStories = allFeatured
    .map((s: any, i: number) => ({ ...s, originalIndex: i }))
    .filter((s: any) => POLICY_CATEGORIES.includes(s.category));

  return {
    globalData: globalSnap.exists() ? globalSnap.data()?.items || [] : [],
    policyStories,
  };
}

export default async function PolicyPage() {
  const { globalData, policyStories } = await getPolicyData();

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="border-b border-zinc-900 mb-8 pb-2">
          <h1 className="text-3xl font-serif font-bold flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-red-800" />
            Policy & Global
          </h1>
        </div>

        {/* Global Briefing */}
        {globalData.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-bold uppercase tracking-widest text-zinc-900 mb-6 border-b border-zinc-200 pb-2">
              Global Briefing
            </h2>
            <div className="space-y-6">
              {globalData.map((item: any, i: number) => (
                <div key={i} className="flex gap-4 group">
                  <span className="text-2xl font-bold text-zinc-200 group-hover:text-red-800 transition-colors font-serif">
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold font-serif text-zinc-900 mb-1 group-hover:text-red-800 transition-colors">
                      {item.headline}
                    </h3>
                    <p className="text-sm text-zinc-600 leading-relaxed">{item.context}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Policy-Related Featured Stories */}
        {policyStories.length > 0 && (
          <section>
            <h2 className="text-lg font-bold uppercase tracking-widest text-zinc-900 mb-6 border-b border-zinc-200 pb-2">
              Related Stories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {policyStories.map((story: any, i: number) => (
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
