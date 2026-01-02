import Link from "next/link";
import { Search, Menu } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Brand Identity */}
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className="flex items-center gap-3 group"
            aria-label="The Keele Street Journal Homepage"
          >
            {/* Logo Placeholder */}
            <div className="h-10 w-10 relative overflow-hidden rounded-sm bg-zinc-900 flex items-center justify-center text-white group-hover:bg-red-800 transition-colors">
               <span className="font-serif font-bold text-lg">K</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-xl font-serif font-bold leading-none tracking-tight text-zinc-900 group-hover:text-red-800 transition-colors">
                The Keele Street Journal
              </span>
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium mt-1">
                Powered by the ESA
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600" aria-label="Main Navigation">
          <Link href="#" className="hover:text-zinc-900 transition-colors">Markets</Link>
          <Link href="#" className="hover:text-zinc-900 transition-colors">Campus</Link>
          <Link href="#" className="hover:text-zinc-900 transition-colors">Policy</Link>
          <Link href="#" className="hover:text-zinc-900 transition-colors">Opinion</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button 
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
            aria-label="Search articles"
          >
            <Search className="w-5 h-5 text-zinc-600" aria-hidden="true" />
          </button>
          <button 
            className="md:hidden p-2 hover:bg-zinc-100 rounded-full"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-zinc-600" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}