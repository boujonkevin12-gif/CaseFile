"use client";

import { ArrowDown } from "lucide-react";
import type { ClientClue, ClientSuspect } from "@/lib/game-types";
import { ClueIcon } from "@/components/game/clue-icon";
import { suspicionLevel, suspicionTone } from "@/lib/suspicion";
import { Badge } from "@/components/ui/badge";

export function TeoriaSection({
  suspects,
  clues,
}: {
  suspects: ClientSuspect[];
  clues: ClientClue[];
}) {
  const linkedSuspects = suspects
    .map((s) => ({ suspect: s, clues: clues.filter((c) => c.implicatesSuspectId === s.id) }))
    .filter((group) => group.clues.length > 0);

  const unlinked = clues.filter((c) => !c.implicatesSuspectId);

  return (
    <div className="animate-fade-up">
      <p className="mb-5 text-sm text-ink-dim">
        Relacioná lo que encontraste. Cada pista vinculada arma una cadena hacia un sospechoso.
      </p>

      {linkedSuspects.length === 0 ? (
        <div className="border border-dashed border-hairline-strong py-14 text-center text-sm text-ink-dim">
          Todavía no tenés suficientes pistas para trazar conexiones.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {linkedSuspects.map(({ suspect, clues: linked }) => {
            const level = suspicionLevel(suspect.id, clues);
            return (
              <div key={suspect.id} className="flex flex-col items-center gap-0 border border-hairline-strong bg-panel p-5">
                {linked.map((c) => (
                  <div key={c.id} className="flex flex-col items-center">
                    <div className="flex items-center gap-2 border border-hairline-strong bg-panel-3 px-3 py-2 text-xs text-ink">
                      <ClueIcon name={c.icon} size={13} className="text-gold" />
                      {c.title}
                    </div>
                    <ArrowDown size={14} className="my-1 text-blood-bright/70" />
                  </div>
                ))}
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full font-display text-ink"
                  style={{ backgroundColor: suspect.avatarColor }}
                >
                  {suspect.name[0]}
                </div>
                <span className="mt-2 font-display text-base text-ink">{suspect.name}</span>
                <Badge tone={suspicionTone[level]} className="mt-2">
                  Sospecha {level.toLowerCase()}
                </Badge>
              </div>
            );
          })}
        </div>
      )}

      {unlinked.length > 0 && (
        <div className="mt-6 border-t border-hairline pt-4">
          <span className="font-mono-tag text-[10px] text-ink-faint">PISTAS SUELTAS, SIN CONEXIÓN CLARA</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {unlinked.map((c) => (
              <span
                key={c.id}
                className="flex items-center gap-1.5 border border-hairline-strong px-2.5 py-1 text-xs text-ink-dim"
              >
                <ClueIcon name={c.icon} size={12} className="text-ink-faint" />
                {c.title}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
