import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface TickerItem {
  symbol: string;
  price: string;
  change: string;
  isUp: boolean;
}

export function Ticker({ items }: { items: TickerItem[] }) {
  // Fallback to avoid crash if DB is empty
  const displayItems = items.length > 0 ? items : [{ symbol: "LOADING...", price: "---", change: "---", isUp: null }];

  return (
    <div className="w-full bg-zinc-950 border-b border-zinc-800 overflow-hidden py-2">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {[...displayItems, ...displayItems, ...displayItems].map((stock, index) => (
          <div key={index} className="flex items-center gap-2 px-6 border-r border-zinc-800/50 min-w-fit">
            <span className="text-xs font-bold text-zinc-100 tracking-wider">{stock.symbol}</span>
            <span className="text-xs font-mono text-zinc-300">{stock.price}</span>
            <div className={`flex items-center text-[10px] font-bold ${
                stock.isUp === true ? "text-emerald-400" : stock.isUp === false ? "text-rose-400" : "text-zinc-500"
              }`}>
              {stock.isUp === true ? <ArrowUp className="w-3 h-3 mr-0.5" /> : stock.isUp === false ? <ArrowDown className="w-3 h-3 mr-0.5" /> : <Minus className="w-3 h-3 mr-0.5" />}
              {stock.change}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}