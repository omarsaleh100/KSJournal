import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface WhatsNewsProps {
  business: string[];
  world: string[];
}

export function WhatsNews({ business, world }: WhatsNewsProps) {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-4 h-full">
      <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100 border-b-2 border-zinc-900 dark:border-zinc-100 pb-2 mb-4">
        What's News
      </h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-[10px] font-bold uppercase text-red-800 dark:text-red-400 mb-2">Business & Finance</h3>
          <ul className="space-y-3">
            {business.length > 0 ? business.map((item, i) => (
              <li key={i} className="text-xs text-zinc-700 dark:text-zinc-300 leading-snug font-serif">
                <span className="mr-1">■</span> {item.replace("- ", "")}
              </li>
            )) : <span className="text-xs text-zinc-400 dark:text-zinc-500">Loading updates...</span>}
          </ul>
        </div>

        <div>
          <h3 className="text-[10px] font-bold uppercase text-red-800 dark:text-red-400 mb-2">World-Wide</h3>
          <ul className="space-y-3">
            {world.length > 0 ? world.map((item, i) => (
              <li key={i} className="text-xs text-zinc-700 dark:text-zinc-300 leading-snug font-serif">
                <span className="mr-1">■</span> {item.replace("- ", "")}
              </li>
            )) : <span className="text-xs text-zinc-400 dark:text-zinc-500">Loading updates...</span>}
          </ul>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700">
         <Link href="/policy" className="flex items-center text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:text-red-800 dark:hover:text-red-400 transition-colors">
            Read the Full Briefing <ChevronRight className="w-3 h-3 ml-1" />
         </Link>
      </div>
    </div>
  );
}
