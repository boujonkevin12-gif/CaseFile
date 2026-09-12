import * as React from "react";
import { cn } from "@/lib/utils";

const toneClasses: Record<string, string> = {
  neutral: "bg-panel-3 text-ink-dim border-hairline-strong",
  gold: "bg-gold/10 text-gold-soft border-gold/40",
  blood: "bg-blood/15 text-red-300 border-blood-bright/40",
  green: "bg-emerald-900/20 text-emerald-300 border-emerald-700/40",
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof toneClasses }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[11px] font-mono-tag uppercase",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-panel-3", className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-blood to-gold transition-all duration-500"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-ink-faint">
      <span className="font-mono-tag text-[11px]">{children}</span>
      <span className="h-px flex-1 bg-hairline" />
    </div>
  );
}
