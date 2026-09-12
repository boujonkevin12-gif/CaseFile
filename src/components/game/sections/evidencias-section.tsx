"use client";

import * as React from "react";
import { ArrowLeft, X } from "lucide-react";
import type { ClientClue, ClientLocation } from "@/lib/game-types";
import { ClueIcon } from "@/components/game/clue-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PhotoSlot } from "@/components/game/photo-slot";
import { slugify } from "@/lib/slug";

const importanceTone: Record<string, "neutral" | "gold" | "blood"> = {
  BAJA: "neutral",
  MEDIA: "neutral",
  ALTA: "gold",
  CLAVE: "blood",
};

const typeLabel: Record<string, string> = {
  FISICA: "Evidencia física",
  TESTIMONIO: "Testimonio",
  DOCUMENTO: "Documento",
  DIGITAL: "Registro digital",
};

export function EvidenciasSection({
  clues,
  totalClues,
  locations,
  reviewed,
  onMarkReviewed,
}: {
  clues: ClientClue[];
  totalClues: number;
  locations: ClientLocation[];
  reviewed: Set<string>;
  onMarkReviewed: (clueId: string) => void;
}) {
  const [selected, setSelected] = React.useState<ClientClue | null>(null);

  if (selected) {
    const locationName = locations.find((l) => l.key === selected.locationKey)?.name;
    const isReviewed = reviewed.has(selected.id);
    return (
      <div className="animate-fade-up">
        <button
          onClick={() => setSelected(null)}
          className="mb-4 flex items-center gap-2 text-xs text-ink-faint hover:text-ink cursor-pointer"
        >
          <ArrowLeft size={14} />
          EVIDENCIA
        </button>

        <div className="border border-hairline-strong bg-panel">
          <PhotoSlot
            src={`/images/evidence/${slugify(selected.title)}.jpg`}
            alt={selected.title}
            className="h-56 border-b border-hairline-strong"
            fallback={
              <div className="paper-texture flex h-56 items-center justify-center border-b border-hairline-strong bg-gradient-to-br from-panel-3 to-void">
                <ClueIcon name={selected.icon} size={56} strokeWidth={1} className="text-gold-soft" />
              </div>
            }
          />
          <div className="flex flex-col gap-4 p-6">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-2xl text-ink">{selected.title}</h2>
              <button onClick={() => setSelected(null)} className="text-ink-faint hover:text-ink lg:hidden">
                <X size={18} />
              </button>
            </div>
            <Badge tone={importanceTone[selected.importance] ?? "neutral"} className="w-fit">
              {selected.importance === "CLAVE" ? "★ Pista importante" : selected.importance}
            </Badge>
            <p className="text-sm leading-relaxed text-ink-dim">{selected.description}</p>
            <dl className="grid grid-cols-1 gap-2 border-t border-hairline pt-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="font-mono-tag text-[10px] text-ink-faint">TIPO</dt>
                <dd className="text-ink-dim">{typeLabel[selected.type] ?? selected.type}</dd>
              </div>
              <div>
                <dt className="font-mono-tag text-[10px] text-ink-faint">UBICACIÓN</dt>
                <dd className="text-ink-dim">{locationName ?? "—"}</dd>
              </div>
              <div>
                <dt className="font-mono-tag text-[10px] text-ink-faint">ESTADO</dt>
                <dd className="text-ink-dim">{isReviewed ? "Revisada" : "Recuperada"}</dd>
              </div>
            </dl>
            {!isReviewed && (
              <Button variant="secondary" size="sm" className="w-fit" onClick={() => onMarkReviewed(selected.id)}>
                Marcar como revisada
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink-dim">Analizá las pruebas encontradas en la investigación.</p>
        <span className="font-mono-tag text-xs text-ink-faint">
          {clues.length}/{totalClues}
        </span>
      </div>

      {clues.length === 0 ? (
        <div className="border border-dashed border-hairline-strong py-14 text-center text-sm text-ink-dim">
          Todavía no encontraste evidencias. Recorré la escena del crimen.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {clues.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className="group relative flex flex-col gap-3 border border-hairline-strong bg-panel p-3 text-left transition-colors hover:border-gold/50 animate-reveal cursor-pointer"
            >
              <div className="h-20">
                <PhotoSlot
                  src={`/images/evidence/${slugify(c.title)}.jpg`}
                  alt={c.title}
                  className="h-20"
                  fallback={
                    <div className="paper-texture flex h-20 items-center justify-center bg-gradient-to-br from-panel-3 to-void">
                      <ClueIcon name={c.icon} size={26} strokeWidth={1.2} className="text-gold-soft" />
                    </div>
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-ink">{c.title}</span>
                <span className="text-[10px] text-ink-faint">{typeLabel[c.type] ?? c.type}</span>
              </div>
              <Badge tone={importanceTone[c.importance] ?? "neutral"} className="w-fit">
                {c.importance}
              </Badge>
              <span className="text-[11px] font-medium text-ink-faint underline decoration-hairline-strong underline-offset-2 group-hover:text-gold-soft">
                Ver detalle
              </span>
              {reviewed.has(c.id) && (
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
