"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileText,
  ScrollText,
  Users,
  MapPin,
  MessageSquareText,
  Network,
  Gavel,
  MoreHorizontal,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type CaseSection =
  | "expediente"
  | "evidencias"
  | "sospechosos"
  | "escena"
  | "interrogatorios"
  | "teoria"
  | "acusar";

const NAV_ITEMS: { id: CaseSection; label: string; icon: typeof FileText }[] = [
  { id: "expediente", label: "Expediente", icon: FileText },
  { id: "evidencias", label: "Evidencias", icon: ScrollText },
  { id: "sospechosos", label: "Sospechosos", icon: Users },
  { id: "escena", label: "Escena", icon: MapPin },
  { id: "interrogatorios", label: "Interrogatorios", icon: MessageSquareText },
  { id: "teoria", label: "Teoría", icon: Network },
  { id: "acusar", label: "Acusar", icon: Gavel },
];

const MOBILE_PRIMARY: CaseSection[] = ["expediente", "evidencias", "sospechosos"];

export function CaseNav({
  active,
  onNavigate,
  username,
  cluesFound,
  cluesTotal,
}: {
  active: CaseSection;
  onNavigate: (section: CaseSection) => void;
  username: string;
  cluesFound: number;
  cluesTotal: number;
}) {
  const [moreOpen, setMoreOpen] = React.useState(false);
  const overflowItems = NAV_ITEMS.filter((i) => !MOBILE_PRIMARY.includes(i.id));
  const overflowActive = overflowItems.some((i) => i.id === active);

  return (
    <>
      {/* ---- Sidebar de escritorio ---- */}
      <aside className="hidden lg:flex lg:w-60 lg:shrink-0 lg:flex-col lg:border-r lg:border-hairline lg:bg-carbon">
        <Link href="/dashboard" className="flex items-center gap-2 border-b border-hairline px-5 py-5">
          <FileText size={18} className="text-blood-bright" />
          <span className="font-display text-lg tracking-tight text-ink">
            CASE<span className="text-blood-bright">FILE</span>
          </span>
        </Link>

        <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex items-center gap-3 rounded-sm px-3 py-2.5 text-left text-sm transition-colors cursor-pointer",
                active === item.id
                  ? "bg-blood-dim/40 text-gold-soft border-l-2 border-blood-bright pl-[10px]"
                  : "text-ink-dim hover:bg-panel-2 hover:text-ink border-l-2 border-transparent pl-[10px]",
              )}
            >
              <item.icon size={16} strokeWidth={1.6} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center justify-between border-t border-hairline px-5 py-4">
          <div className="flex items-center gap-2 text-xs text-ink-faint">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-panel-3 font-display text-[11px] text-ink">
              {username[0]?.toUpperCase()}
            </span>
            {username}
          </div>
          <Settings size={15} className="text-ink-faint" />
        </div>
      </aside>

      {/* ---- Barra superior móvil ---- */}
      <div className="flex items-center justify-between border-b border-hairline bg-carbon px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-blood-bright" />
          <span className="font-display text-base tracking-tight text-ink">
            CASE<span className="text-blood-bright">FILE</span>
          </span>
        </div>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-panel-3 font-display text-xs text-ink">
          {username[0]?.toUpperCase()}
        </span>
      </div>

      {/* ---- Barra inferior móvil ---- */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-hairline bg-carbon/97 backdrop-blur lg:hidden">
        {MOBILE_PRIMARY.map((id) => {
          const item = NAV_ITEMS.find((n) => n.id === id)!;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] cursor-pointer",
                active === id ? "text-gold-soft" : "text-ink-faint",
              )}
            >
              <item.icon size={18} strokeWidth={1.6} />
              {item.label}
              {id === "evidencias" && (
                <span className="absolute mt-[-20px] ml-6 font-mono-tag text-[9px] text-blood-bright">
                  {cluesFound}/{cluesTotal}
                </span>
              )}
            </button>
          );
        })}
        <button
          onClick={() => setMoreOpen(true)}
          className={cn(
            "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] cursor-pointer",
            overflowActive ? "text-gold-soft" : "text-ink-faint",
          )}
        >
          <MoreHorizontal size={18} strokeWidth={1.6} />
          Más
        </button>
      </nav>

      {/* ---- Hoja de navegación adicional (móvil) ---- */}
      {moreOpen && (
        <div className="fixed inset-0 z-40 flex items-end lg:hidden">
          <button
            aria-label="Cerrar"
            className="absolute inset-0 bg-void/80"
            onClick={() => setMoreOpen(false)}
          />
          <div className="relative z-10 w-full rounded-t-sm border-t border-hairline-strong bg-panel-2 px-4 pb-8 pt-4 animate-fade-up">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono-tag text-[11px] text-ink-faint">MÁS SECCIONES</span>
              <button onClick={() => setMoreOpen(false)} className="text-ink-faint">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {overflowItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMoreOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-sm border px-3 py-3 text-sm cursor-pointer",
                    active === item.id
                      ? "border-blood-bright/50 bg-blood-dim/30 text-gold-soft"
                      : "border-hairline text-ink-dim",
                  )}
                >
                  <item.icon size={16} strokeWidth={1.6} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
