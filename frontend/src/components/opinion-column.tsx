import Link from "next/link";
import { Quote } from "lucide-react";

const OPINIONS = [
  { title: "Why The Carbon Tax Debate Misses the Point", author: "Dr. A. Smith", role: "Prof. of Microeconomics" },
  { title: "The Case for a Four-Day Study Week", author: "J. Doe", role: "ESA President" },
  { title: "Crypto is Dead. Long Live Crypto.", author: "M. Zhang", role: "Fintech Analyst" },
];

export function OpinionColumn() {
  return (
    <div className="h-full">
      <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-900 border-b border-zinc-200 pb-2 mb-4 flex items-center gap-2">
        <Quote className="w-3 h-3 text-red-800" /> Opinion
      </h2>
      
      <div className="flex flex-col gap-6 divide-y divide-zinc-100">
        {OPINIONS.map((op, i) => (
          <div key={i} className={`flex flex-col ${i > 0 ? "pt-4" : ""}`}>
             <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
               {op.author}
             </span>
             <Link href="#" className="group">
               <h3 className="text-sm font-serif font-bold text-zinc-900 leading-tight group-hover:text-red-800 transition-colors mb-1">
                 {op.title}
               </h3>
             </Link>
             <span className="text-[10px] text-zinc-500 italic">
               {op.role}
             </span>
          </div>
        ))}
      </div>
    </div>
  );
}