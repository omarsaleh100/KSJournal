import Link from "next/link";
import { Menu } from "lucide-react";

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
            <img
              src="/ksj-logo.png"
              alt="KSJ Logo"
              className="h-10 w-10 object-contain"
            />

            <span className="text-xl font-serif font-bold leading-none tracking-tight text-zinc-900 group-hover:text-red-800 transition-colors">
              The Keele Street Journal
            </span>
          </Link>
        </div>

        {/* Navigation (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600" aria-label="Main Navigation">
          <Link href="/markets" className="hover:text-zinc-900 transition-colors">Markets</Link>
          <Link href="/campus" className="hover:text-zinc-900 transition-colors">Campus</Link>
          <Link href="/policy" className="hover:text-zinc-900 transition-colors">Policy</Link>
          <Link href="/opinion" className="hover:text-zinc-900 transition-colors">Opinion</Link>
        </nav>

        {/* Mobile Menu */}
        <div className="flex items-center gap-4">
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
