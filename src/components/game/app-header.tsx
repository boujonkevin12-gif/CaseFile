import Link from "next/link";
import { UserRound } from "lucide-react";

export function AppHeader({
  username,
  level,
  caseCode,
}: {
  username: string;
  level: number;
  caseCode?: string;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-carbon/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="font-display text-lg tracking-tight text-ink">
            CASE<span className="text-blood-bright">FILE</span>
          </span>
          {caseCode && (
            <span className="font-mono-tag text-[11px] text-ink-faint">/ {caseCode}</span>
          )}
        </Link>
        <Link
          href="/profile"
          className="flex items-center gap-2 border border-hairline px-3 py-1.5 text-xs text-ink-dim transition-colors hover:border-gold/50 hover:text-gold-soft"
        >
          <UserRound size={14} />
          <span>{username}</span>
          <span className="font-mono-tag text-ink-faint">NVL {level}</span>
        </Link>
      </div>
    </header>
  );
}
