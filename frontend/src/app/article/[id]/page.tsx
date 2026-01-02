import { Header } from "@/components/header";
import { ArrowLeft, Share2, Printer, Bookmark, Clock } from "lucide-react"; // Removed Ticker import
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/firebase"; 
import { doc, getDoc } from "firebase/firestore";

// --- FETCH DATA FUNCTION ---
async function getArticleData(id: string) {
  // Case 1: The "Hero" Story (Live from Database)
  if (id === "hero") {
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

  // Case 2: Fallback Mock Data
  const MOCK_ARTICLES: Record<string, any> = {
    "2": {
      category: "Campus Economy",
      title: "York University Announces New Fintech Research Grant",
      subtitle: "The Department of Economics has secured a $2M grant to study the effects of decentralized finance on Canadian banking structures.",
      date: "DEC 27, 2025",
      author: "Sarah Jenkins",
      readTime: "3 min read",
      content: [
        "York University has announced a landmark $2 million research grant aimed at exploring the intersection of decentralized finance (DeFi) and traditional Canadian banking structures.",
        "The grant, provided by the Federal Economic Development Agency, will establish a new specialized lab within the Vari Hall extension. 'This is a pivotal moment for student researchers,' said Dean Alistair.",
        "Students will have the opportunity to work directly with blockchain ledger technology and simulate market crashes to test resilience."
      ],
      keyPoints: ["$2M Grant secured from FedDev", "New lab opening in Vari Hall", "Focus on student-led DeFi research"]
    },
    "3": {
      category: "Real Estate",
      title: "Toronto Housing Market Sees Unexpected Q4 Rally",
      subtitle: "Despite high interest rates, inventory shortages are driving prices up in the GTA suburbs.",
      date: "DEC 26, 2025",
      author: "R. Singh",
      readTime: "4 min read",
      content: [
        "The Greater Toronto Area real estate market defied analyst expectations in Q4, posting a 3.2% increase in benchmark prices despite the Bank of Canada's restrictive rate policy.",
        "Supply shortages remain the primary driver. Listings hit a 10-year low in November, forcing buyers into competitive bidding wars for the few available entry-level homes.",
        "Economists warn that this rally may be short-lived if unemployment figures tick up in Q1 2026."
      ],
      keyPoints: ["Benchmark price up 3.2%", "Listings at 10-year lows", "Bidding wars return to suburbs"]
    }
  };

  return MOCK_ARTICLES[id] || null;
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getArticleData(id);

  if (!article) return notFound();

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      <Header />
      {/* Ticker Removed from here */}

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

            <div className="flex items-center gap-2">
              <button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-all" aria-label="Bookmark this article">
                <Bookmark className="w-5 h-5" aria-hidden="true" />
              </button>
              <button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-all" aria-label="Share this article">
                <Share2 className="w-5 h-5" aria-hidden="true" />
              </button>
              <button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-all" aria-label="Print this article">
                <Printer className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </header>

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