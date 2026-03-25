import Link from "next/link";
import { Menu } from "lucide-react";
import { DarkModeToggle } from "./dark-mode-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
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

            <span className="text-xl font-serif font-bold leading-none tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-red-800 dark:group-hover:text-red-400 transition-colors">
              The Keele Street Journal
            </span>
          </Link>
        </div>

        {/* Navigation (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400" aria-label="Main Navigation">
          <Link href="/markets" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Markets</Link>
          <Link href="/campus" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Campus</Link>
          <Link href="/policy" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Policy</Link>
          <Link href="/opinion" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Opinion</Link>
          <DarkModeToggle />
        </nav>

        {/* Mobile Menu */}
        <div className="flex items-center gap-2">
          <div className="md:hidden">
            <DarkModeToggle />
          </div>
          <button
            className="md:hidden p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-zinc-600 dark:text-zinc-400" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
