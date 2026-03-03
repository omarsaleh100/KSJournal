import { Header } from "@/components/header";
import { Ticker } from "@/components/ticker";
import { NewsCard } from "@/components/news-card";
import { WhatsNews } from "@/components/whats-news";
import { OpinionColumn } from "@/components/opinion-column";
import { NewsletterForm } from "@/components/newsletter-form";
import Link from "next/link";
import { BarChart3, TrendingUp, Users } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { CurrentDate } from "@/components/current-date";
import { SafeImage } from "@/components/safe-image";
import { slugify } from "@/lib/utils";

async function getDailyEdition() {
  // Fetch ALL collections in parallel for speed
  const [tickerSnap, newsSnap, heroSnap, featuredSnap, globalSnap, deepDiveSnap, campusSnap, opinionsSnap] = await Promise.all([
    getDoc(doc(db, "system", "market_ticker")),
    getDoc(doc(db, "daily_edition", "whats_news")),
    getDoc(doc(db, "daily_edition", "hero_story")),
    getDoc(doc(db, "daily_edition", "featured_stories")),
    getDoc(doc(db, "daily_edition", "global_briefing")),
    getDoc(doc(db, "daily_edition", "deep_dive")),
    getDoc(doc(db, "daily_edition", "campus_news")),
    getDoc(doc(db, "daily_edition", "opinions")),
  ]);

  return {
    tickerData: tickerSnap.exists() ? tickerSnap.data()?.items : [],
    newsData: newsSnap.exists() ? newsSnap.data() : { business: [], world: [] },
    heroData: heroSnap.exists() ? heroSnap.data() : null,
    featuredData: featuredSnap.exists() ? featuredSnap.data()?.items : [],
    globalData: globalSnap.exists() ? globalSnap.data()?.items : [],
    deepDiveData: deepDiveSnap.exists() ? deepDiveSnap.data() : null,
    campusData: campusSnap.exists() ? campusSnap.data()?.items : [],
    opinionsData: opinionsSnap.exists() ? opinionsSnap.data()?.items : [],
  };
}

export default async function Home() {
  const { tickerData, newsData, heroData, featuredData, globalData, deepDiveData, campusData, opinionsData } = await getDailyEdition();

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 selection:bg-red-100 selection:text-red-900">
      <Header />
      <Ticker items={tickerData} />

      <main className="container mx-auto px-4 py-8">
        
        {/* Date Header */}
        <div className="border-b border-zinc-900 mb-8 pb-1 flex justify-between items-end">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
            Vol. CXXIV No. 12
          </span>
          <span className="text-xs font-serif italic text-zinc-500">
            <CurrentDate />  {/* <--- Replaced the old span code with this */}
          </span>
        </div>

        {/* SECTION 1: THE BROADSHEET */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b border-zinc-900 pb-12 mb-12">
          
          {/* LEFT: WHAT'S NEWS */}
          <aside className="lg:col-span-3 lg:border-r lg:border-zinc-200 lg:pr-6">
            <WhatsNews business={newsData.business || []} world={newsData.world || []} />
          </aside>

          {/* CENTER: HERO & FEATURED */}
          <section className="lg:col-span-6">
            {/* 1. Real Hero Story */}
            {heroData ? (
              <article className="mb-8 group cursor-pointer">
                <div className="relative aspect-video w-full mb-4 overflow-hidden bg-zinc-100">
                    <SafeImage src={heroData.imageUrl} alt="Hero" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-red-800 uppercase tracking-widest">Special Report</span>
                  <Link href={`/article/hero-${slugify(heroData.title)}`}>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-zinc-900 leading-tight group-hover:text-red-800 transition-colors">
                      {heroData.title}
                    </h1>
                  </Link>
                  <p className="text-lg text-zinc-600 font-serif leading-relaxed line-clamp-3">
                    {heroData.subtitle}
                  </p>
                  <span className="text-xs font-bold text-zinc-400 mt-2">By {heroData.author}</span>
                </div>
              </article>
            ) : <div className="h-64 bg-zinc-50 animate-pulse" />}
            
            {/* 2. Real Featured Stories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-zinc-100">
               {featuredData.length > 0 ? featuredData.map((news: any, i: number) => (
                 <NewsCard
                    key={i}
                    id={`featured-${i}-${slugify(news.title)}`}
                    category={news.category}
                    title={news.title}
                    summary={news.summary}
                    date={news.date}
                    author={news.author}
                    className="border-none p-0 shadow-none hover:shadow-none bg-transparent"
                 />
               )) : <p className="text-xs text-zinc-400">Loading featured news...</p>}
            </div>
          </section>

          {/* RIGHT: OPINION */}
          <aside className="lg:col-span-3 lg:border-l lg:border-zinc-200 lg:pl-6">
            <OpinionColumn opinions={opinionsData} />
          </aside>
        </div>


        {/* SECTION 2: REAL DEEP DIVE */}
        <section className="bg-zinc-900 text-zinc-50 -mx-4 px-4 py-16 mb-16">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8 border-b border-zinc-700 pb-4">
               <h2 className="text-xl font-bold uppercase tracking-widest text-white flex items-center gap-2">
                 <BarChart3 className="w-5 h-5 text-red-500" /> Market Deep Dive
               </h2>
               <span className="text-xs text-zinc-400">Analysis provided by AI Economist</span>
            </div>
            {deepDiveData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {deepDiveData.cards?.map((card: any, idx: number) => (
                  <div key={idx} className={`border-t-2 ${idx === 0 ? 'border-red-700' : 'border-zinc-700'} pt-4`}>
                    <h3 className="text-lg font-serif font-bold mb-2 text-white">{card.title}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed mb-4">{card.analysis}</p>
                    <Link href={`/article/deep-dive-${idx}-${slugify(card.title)}`} className="text-xs font-bold text-zinc-500 uppercase hover:text-red-500 transition-colors">
                      Read Analysis →
                    </Link>
                  </div>
                ))}
                <div className="bg-zinc-800 p-6 flex flex-col justify-center items-center text-center">
                   <span className="text-4xl font-bold text-white mb-2">{deepDiveData.stat?.value}</span>
                   <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">{deepDiveData.stat?.label}</span>
                   <span className="text-[10px] text-zinc-500 mt-2">{deepDiveData.stat?.source}</span>
                </div>
              </div>
            ) : <p className="text-zinc-500">Analysis loading...</p>}
          </div>
        </section>

        {/* SECTION 3: REAL CAMPUS NEWS */}
          <section className="mb-16 border-b border-zinc-200 pb-12">
            <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-red-800" />
                <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-900">Campus & Career</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {campusData.length > 0 ? campusData.map((item: any, i: number) => (
                  <a 
                    key={i} 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="group cursor-pointer block"
                  >
                    <div className="h-32 bg-zinc-100 mb-3 relative overflow-hidden rounded-sm">
                        <SafeImage
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>

                    <span className="text-[10px] font-bold text-red-800 uppercase mb-1 block">
                      {item.category}
                    </span>
                    <h3 className="text-sm font-bold font-serif text-zinc-900 leading-tight group-hover:underline">
                      {item.title}
                    </h3>
                    
                    {/* UPDATED: Show Author and Source */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase">
                        {item.author || "Staff"}
                      </span>
                      <span className="text-[9px] text-zinc-300">|</span>
                      <span className="text-[9px] text-zinc-400">
                        Source: YFile
                      </span>
                    </div>
                  </a>
                )) : <p>Loading campus news...</p>}
            </div>
          </section>

        {/* SECTION 4: REAL GLOBAL BRIEFING */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-12">
           <div className="md:col-span-8">
              <div className="flex items-center gap-2 mb-6 border-b border-zinc-200 pb-2">
                <TrendingUp className="w-5 h-5 text-red-800" />
                <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-900">Global Briefing</h2>
              </div>
              <div className="space-y-6">
                {globalData.map((item: any, i: number) => (
                  <div key={i} className="flex gap-4 group cursor-pointer">
                    <span className="text-2xl font-bold text-zinc-200 group-hover:text-red-800 transition-colors font-serif">0{i + 1}</span>
                    <div>
                       <h3 className="text-lg font-bold font-serif text-zinc-900 mb-1 group-hover:text-red-800 transition-colors">{item.headline}</h3>
                       <p className="text-sm text-zinc-600 leading-relaxed">{item.context}</p>
                    </div>
                  </div>
                ))}
              </div>
           </div>
           
           {/* Newsletter Signup */}
           <div className="md:col-span-4">
              <div className="bg-zinc-100 p-6 border border-zinc-200 sticky top-24">
                 <h3 className="text-lg font-serif font-bold text-zinc-900 mb-2">The Daily Brief</h3>
                 <p className="text-sm text-zinc-600 mb-4">Essential economic news, delivered to your inbox every morning.</p>
                 <NewsletterForm />
              </div>
           </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-zinc-950 text-zinc-400 py-12 border-t border-zinc-800">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
           <div>
             <span className="text-white font-serif font-bold text-lg block mb-4">The Keele Street Journal</span>
             <p className="mb-4">AI-powered financial newspaper for York University&apos;s Economics Students. Market analysis, campus news, and economic insights updated daily.</p>
           </div>
           <div>
             <h4 className="text-white font-bold uppercase tracking-widest mb-4 text-xs">Sections</h4>
             <ul className="space-y-2">
               <li><Link href="/markets" className="hover:text-white">Markets</Link></li>
               <li><Link href="/campus" className="hover:text-white">Campus</Link></li>
               <li><Link href="/policy" className="hover:text-white">Policy</Link></li>
               <li><Link href="/opinion" className="hover:text-white">Opinion</Link></li>
             </ul>
           </div>
           <div>
             <h4 className="text-white font-bold uppercase tracking-widest mb-4 text-xs">Legal</h4>
             <ul className="space-y-2">
               <li><Link href="/legal" className="hover:text-white">Disclaimer & Terms</Link></li>
             </ul>
           </div>
           <div>
             <h4 className="text-white font-bold uppercase tracking-widest mb-4 text-xs">Connect</h4>
             <ul className="space-y-2">
               <li><a href="https://x.com/oomarsalehh" target="_blank" rel="noopener noreferrer" className="hover:text-white">X (Twitter)</a></li>
               <li><a href="https://www.linkedin.com/in/omarsaleh001" target="_blank" rel="noopener noreferrer" className="hover:text-white">LinkedIn</a></li>
             </ul>
           </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-zinc-900 text-center text-xs text-zinc-600">
           &copy; 2025 The Keele Street Journal. All rights reserved.
        </div>
      </footer>
    </div>
  );
}