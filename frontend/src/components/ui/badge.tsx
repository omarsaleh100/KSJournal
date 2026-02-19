import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

const variantStyles: Record<string, string> = {
  default: "border-transparent bg-zinc-900 text-zinc-50 shadow",
  secondary: "border-transparent bg-zinc-100 text-zinc-900",
  destructive: "border-transparent bg-red-500 text-zinc-50 shadow",
  outline: "text-zinc-950",
};

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
export type { BadgeProps };
