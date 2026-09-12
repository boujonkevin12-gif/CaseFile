"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  eyebrow?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        aria-label="Cerrar"
        className="absolute inset-0 bg-void/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 max-h-[85vh] w-full overflow-y-auto scrollbar-thin rounded-sm border border-hairline-strong bg-panel-2 shadow-2xl animate-fade-up",
          wide ? "max-w-2xl" : "max-w-md",
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-hairline px-6 py-4">
          <div>
            {eyebrow && (
              <div className="mb-1 font-mono-tag text-[11px] text-ink-faint">{eyebrow}</div>
            )}
            <h2 className="font-display text-xl text-ink">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-sm p-1 text-ink-faint hover:text-ink hover:bg-panel-3 cursor-pointer"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
