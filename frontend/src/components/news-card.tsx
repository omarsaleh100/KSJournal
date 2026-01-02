import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface NewsCardProps {
  id: string | number; // <--- Added ID
  category: string;
  title: string;
  summary: string;
  date: string;
  author: string;
  className?: string;
}

export function NewsCard({ id, category, title, summary, date, author, className }: NewsCardProps) {
  return (
    <article className={`group relative flex flex-col justify-between h-full p-6 border border-zinc-200 bg-white hover:border-zinc-300 transition-all hover:shadow-sm ${className}`}>
      
      <div className="absolute top-0 left-0 w-full h-1 bg-zinc-900 group-hover:bg-red-700 transition-colors" />

      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-red-700">
            {category}
          </span>
          <span className="text-xs text-zinc-400 font-mono">
            {date}
          </span>
        </div>

        <h3 className="text-xl font-serif font-bold text-zinc-900 mb-3 group-hover:underline decoration-2 decoration-red-700/30 underline-offset-4 leading-tight">
          {/* Link to the dynamic article page */}
          <Link href={`/article/${id}`} className="focus:outline-none">
            <span className="absolute inset-0" aria-hidden="true" />
            {title}
          </Link>
        </h3>

        <p className="text-sm text-zinc-600 leading-relaxed mb-6 line-clamp-3">
          {summary}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-zinc-100 mt-auto">
        <span className="text-xs font-medium text-zinc-500">
          By {author}
        </span>
        <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-red-700 transition-colors" />
      </div>
    </article>
  );
}