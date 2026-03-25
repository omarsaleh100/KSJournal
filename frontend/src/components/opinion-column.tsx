import Link from "next/link";
import { Quote } from "lucide-react";
import { slugify } from "@/lib/utils";

interface Opinion {
  title: string;
  author: string;
  role: string;
  snippet?: string;
}

const FALLBACK_OPINIONS: Opinion[] = [
  { title: "Why The Carbon Tax Debate Misses the Point", author: "Dr. A. Smith", role: "Prof. of Microeconomics" },
  { title: "The Case for a Four-Day Study Week", author: "J. Doe", role: "ESA President" },
  { title: "Crypto is Dead. Long Live Crypto.", author: "M. Zhang", role: "Fintech Analyst" },
];

export function OpinionColumn({ opinions = [] }: { opinions?: Opinion[] }) {
  const displayOpinions = opinions.length > 0 ? opinions : FALLBACK_OPINIONS;

  return (
    <div className="h-full">
      <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-700 pb-2 mb-4 flex items-center gap-2">
        <Quote className="w-3 h-3 text-red-800 dark:text-red-400" /> Opinion
      </h2>

      <div className="flex flex-col gap-6 divide-y divide-zinc-100 dark:divide-zinc-800">
        {displayOpinions.map((op, i) => (
          <div key={i} className={`flex flex-col ${i > 0 ? "pt-4" : ""}`}>
             <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-1">
               {op.author}
             </span>
             <Link href={`/article/opinion-${i}-${slugify(op.title)}`} className="group">
               <h3 className="text-sm font-serif font-bold text-zinc-900 dark:text-zinc-100 leading-tight group-hover:text-red-800 dark:group-hover:text-red-400 transition-colors mb-1">
                 {op.title}
               </h3>
             </Link>
             <span className="text-[10px] text-zinc-500 dark:text-zinc-400 italic">
               {op.role}
             </span>
          </div>
        ))}
      </div>
    </div>
  );
}
