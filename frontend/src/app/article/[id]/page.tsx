import { Header } from "@/components/header";
import { ArrowLeft, Clock } from "lucide-react";
import { ShareButton } from "@/components/share-button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/firebase"; 
import { doc, getDoc } from "firebase/firestore";
import { SafeImage } from "@/components/safe-image";

// Parse index from slug like "featured-0-some-title" or legacy "featured-0"
function parseIndex(id: string, prefix: string): number {
  const rest = id.slice(prefix.length);
  const match = rest.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : -1;
}

// --- FETCH DATA FUNCTION ---
async function getArticleData(id: string) {
  // Case 1: The "Hero" Story (Live from Database)
  if (id === "hero" || id.startsWith("hero-")) {
    try {
      const docSnap = await getDoc(doc(db, "daily_edition", "hero_story"));
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: "hero",
          category: "Special Report",
          title: data.title,
          subtitle: data.subtitle,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          author: data.author || "The Editorial Board",
          readTime: "5 min read",
          content: data.content || [], 
          keyPoints: data.keyPoints || [],
          imageUrl: data.imageUrl
        };
      }
    } catch (error) {
      console.error("Error fetching hero story:", error);
    }
  }

  // Case 2: Featured Story
  if (id.startsWith("featured-")) {
    try {
      const index = parseIndex(id, "featured-");
      const docSnap = await getDoc(doc(db, "daily_edition", "featured_stories"));
      if (docSnap.exists()) {
        const items = docSnap.data()?.items || [];
        const story = items[index];
        if (story) {
          return {
            id: id,
            category: story.category || "Featured",
            title: story.title,
            subtitle: story.summary,
            date: story.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            author: story.author || "Staff",
            readTime: "3 min read",
            content: story.content || [story.summary],
            keyPoints: story.keyPoints || [],
            imageUrl: story.imageUrl || null,
          };
        }
      }
    } catch (error) {
      console.error("Error fetching featured story:", error);
    }
  }

  // Case 3: Deep Dive analysis card
  if (id.startsWith("deep-dive-")) {
    try {
      const index = parseIndex(id, "deep-dive-");
      const docSnap = await getDoc(doc(db, "daily_edition", "deep_dive"));
      if (docSnap.exists()) {
        const cards = docSnap.data()?.cards || [];
        const card = cards[index];
        if (card) {
          return {
            id: id,
            category: "Market Deep Dive",
            title: card.title,
            subtitle: card.analysis,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            author: "AI Economist",
            readTime: "4 min read",
            content: card.content || [card.analysis],
            keyPoints: card.keyPoints || [],
            imageUrl: null,
          };
        }
      }
    } catch (error) {
      console.error("Error fetching deep dive:", error);
    }
  }

  // Case 4: Opinion piece
  if (id.startsWith("opinion-")) {
    try {
      const index = parseIndex(id, "opinion-");
      const docSnap = await getDoc(doc(db, "daily_edition", "opinions"));
      if (docSnap.exists()) {
        const items = docSnap.data()?.items || [];
        const opinion = items[index];
        if (opinion) {
          return {
            id: id,
            category: "Opinion",
            title: opinion.title,
            subtitle: opinion.snippet || "",
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            author: opinion.author,
            readTime: "4 min read",
            content: opinion.content || [opinion.snippet || ""],
            keyPoints: opinion.keyPoints || [],
            imageUrl: null,
          };
        }
      }
    } catch (error) {
      console.error("Error fetching opinion:", error);
    }
  }

  return null;
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getArticleData(id);

  if (!article) return notFound();

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-red-700 transition-colors"
            aria-label="Back to The Keele Street Journal Homepage"
          >
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            Back to Journal
          </Link>
        </div>

        {/* Article Header */}
        <header className="mb-10 border-b border-zinc-200 pb-10">
          <div className="flex items-center gap-4 mb-6">
            <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-bold uppercase tracking-widest rounded-sm">
              {article.category}
            </span>
            <span className="flex items-center text-zinc-500 text-xs font-medium">
              <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
              {article.readTime}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-zinc-900 leading-tight mb-6">
            {article.title}
          </h1>

          <p className="text-xl md:text-2xl text-zinc-500 font-serif leading-relaxed max-w-3xl">
            {article.subtitle}
          </p>

          <div className="mt-8 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-zinc-900 uppercase tracking-wide">
                By {article.author}
              </span>
              <span className="text-xs text-zinc-400 font-mono mt-1">
                PUBLISHED: {article.date}
              </span>
            </div>

            <ShareButton />
          </div>
        </header>

        {/* Hero Image */}
        {article.imageUrl && (
          <div className="mb-10 relative aspect-video w-full overflow-hidden bg-zinc-100 rounded-sm">
            <SafeImage src={article.imageUrl} alt={article.title} className="object-cover w-full h-full" />
          </div>
        )}

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sidebar */}
          <aside className="lg:col-span-4 order-2 lg:order-1">
            <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-sm sticky top-24">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900 mb-4 border-b border-zinc-200 pb-2">
                Key Takeaways
              </h3>
              <ul className="space-y-4">
                {article.keyPoints && article.keyPoints.map((point: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-zinc-700 leading-relaxed">
                    <span className="min-w-1.5 h-1.5 rounded-full bg-red-700 mt-2" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Article Body */}
          <article className="lg:col-span-8 order-1 lg:order-2">
            <div className="prose prose-lg prose-zinc max-w-none font-serif">
               {Array.isArray(article.content) && article.content.map((paragraph: string, idx: number) => (
                  <p key={idx} className={`mb-6 leading-loose text-zinc-800 ${idx === 0 ? "first-letter:text-5xl first-letter:font-bold first-letter:text-zinc-900 first-letter:mr-3 first-letter:float-left first-letter:leading-none" : ""}`}>
                    {paragraph}
                  </p>
               ))}
            </div>
          </article>

        </div>
      </main>
    </div>
  );
}