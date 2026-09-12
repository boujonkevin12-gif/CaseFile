"use client";

import * as React from "react";
import { AlertTriangle, Check } from "lucide-react";
import type { ClientClue, ClientSuspect } from "@/lib/game-types";
import { ClueIcon } from "@/components/game/clue-icon";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { confirmAccusation } from "@/app/actions/case-actions";
import { cn } from "@/lib/utils";

export function AcusarSection({
  investigationId,
  suspects,
  clues,
}: {
  investigationId: string;
  suspects: ClientSuspect[];
  clues: ClientClue[];
}) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [confirming, setConfirming] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  const selected = suspects.find((s) => s.id === selectedId) ?? null;
  const linkedClues = selected ? clues.filter((c) => c.implicatesSuspectId === selected.id) : [];

  function submit() {
    if (!selected) return;
    startTransition(async () => {
      await confirmAccusation(investigationId, selected.id);
    });
  }

  return (
    <div className="animate-fade-up">
      <p className="mb-5 text-sm text-ink-dim">
        Elegí a quién creés culpable. Esta decisión cierra el caso: no hay vuelta atrás.
      </p>

      <div className="grid grid-cols-1 gap-0 border border-hairline-strong lg:grid-cols-3">
        <div className="border-b border-hairline-strong p-4 lg:border-b-0 lg:border-r">
          <span className="font-mono-tag text-[10px] text-ink-faint">1. SELECCIONAR SOSPECHOSO</span>
          <div className="mt-3 flex flex-col gap-2">
            {suspects.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={cn(
                  "flex items-center gap-3 border px-3 py-2.5 text-left transition-colors cursor-pointer",
                  selectedId === s.id
                    ? "border-blood-bright/60 bg-blood-dim/30"
                    : "border-hairline-strong hover:border-hairline-strong hover:bg-panel-2",
                )}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm text-ink"
                  style={{ backgroundColor: s.avatarColor }}
                >
                  {s.name[0]}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-ink">{s.name}</span>
                  <span className="text-xs text-ink-faint">{s.job}</span>
                </div>
                {selectedId === s.id && <Check size={14} className="ml-auto text-blood-bright" />}
              </button>
            ))}
          </div>
        </div>

        <div className="border-b border-hairline-strong p-4 lg:border-b-0 lg:border-r">
          <span className="font-mono-tag text-[10px] text-ink-faint">2. TU TEORÍA</span>
          {!selected ? (
            <p className="mt-3 text-xs text-ink-faint">Elegí un sospechoso para ver tu razonamiento.</p>
          ) : (
            <div className="mt-3 flex flex-col gap-2 text-sm text-ink-dim">
              <p>
                <span className="text-ink">{selected.name}</span> — {selected.relationship.toLowerCase()}.
              </p>
              <p className="text-xs text-ink-faint">
                {linkedClues.length > 0
                  ? `${linkedClues.length} evidencia(s) lo vinculan directamente a la escena.`
                  : "Ninguna evidencia lo vincula todavía de forma directa."}
              </p>
            </div>
          )}
        </div>

        <div className="p-4">
          <span className="font-mono-tag text-[10px] text-ink-faint">3. EVIDENCIAS</span>
          {!selected ? (
            <p className="mt-3 text-xs text-ink-faint">—</p>
          ) : linkedClues.length === 0 ? (
            <p className="mt-3 text-xs text-ink-faint">Sin evidencias directas encontradas.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {linkedClues.map((c) => (
                <li key={c.id} className="flex items-center gap-2 text-sm text-ink-dim">
                  <ClueIcon name={c.icon} size={13} className="text-gold" />
                  {c.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Button
        variant="primary"
        size="lg"
        className="mt-5 w-full uppercase sm:w-auto"
        disabled={!selected}
        onClick={() => setConfirming(true)}
      >
        Presentar acusación →
      </Button>

      {confirming && selected && (
        <Modal open onClose={() => setConfirming(false)} eyebrow="CONFIRMAR ACUSACIÓN" title={selected.name}>
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <AlertTriangle size={28} className="text-blood-bright" />
            <p className="text-sm text-ink-dim">
              Estás por acusar a <span className="text-ink">{selected.name}</span>. Esta decisión
              no puede deshacerse: el caso se cierra apenas confirmes.
            </p>
            <div className="mt-2 flex w-full gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirming(false)}>
                Volver
              </Button>
              <Button variant="primary" className="flex-1 uppercase" disabled={pending} onClick={submit}>
                {pending ? "Cerrando caso..." : "Confirmar"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
