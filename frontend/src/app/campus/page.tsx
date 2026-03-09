export const dynamic = "force-dynamic";

import { Header } from "@/components/header";
import { Users } from "lucide-react";
import { SafeImage } from "@/components/safe-image";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

async function getCampusData() {
  const snap = await getDoc(doc(db, "daily_edition", "campus_news"));
  return snap.exists() ? snap.data()?.items || [] : [];
}

export default async function CampusPage() {
  const campusData = await getCampusData();

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="border-b border-zinc-900 mb-8 pb-2">
          <h1 className="text-3xl font-serif font-bold flex items-center gap-3">
            <Users className="w-7 h-7 text-red-800" />
            Campus & Career
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {campusData.length > 0 ? (
            campusData.slice(0, 3).map((item: any, i: number) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group cursor-pointer block"
              >
                <div className="h-40 bg-zinc-100 mb-3 relative overflow-hidden rounded-sm">
                  <SafeImage
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <span className="text-[10px] font-bold text-red-800 uppercase mb-1 block">
                  {item.category || "Campus"}
                </span>
                <h3 className="text-sm font-bold font-serif text-zinc-900 leading-tight group-hover:underline mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-500 line-clamp-2 mb-2">
                  {item.summary}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase">
                    {item.author || "Staff"}
                  </span>
                  <span className="text-[9px] text-zinc-300">|</span>
                  <span className="text-[9px] text-zinc-400">Source: YFile</span>
                </div>
              </a>
            ))
          ) : (
            <p className="text-zinc-400 col-span-full">No campus stories available.</p>
          )}

          {/* Fixed Blunt Card */}
          <a
            href="https://blunt.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="group cursor-pointer block"
          >
            <div className="h-40 bg-zinc-100 mb-3 relative overflow-hidden rounded-sm">
              <SafeImage
                src="/blunt-banner.png"
                alt="Blunt"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <h3 className="text-sm font-bold font-serif text-zinc-900 leading-tight group-hover:underline mb-2">
              Software company Blunt assigns value to anything imaginable
            </h3>
            <p className="text-xs text-zinc-500 line-clamp-2 mb-2">
              Blunt builds software that assigns value to anything imaginable — from ideas and assets to opportunities and impact.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-zinc-500 uppercase">
                BLUNT
              </span>
              <span className="text-[9px] text-zinc-300">|</span>
              <span className="text-[9px] text-zinc-400">Source: blunt.ai</span>
            </div>
          </a>
        </div>
      </main>
    </div>
  );
}
