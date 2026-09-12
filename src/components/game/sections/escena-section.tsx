"use client";

import * as React from "react";
import { Search, CheckCircle2, Sparkles, Coins, Eye } from "lucide-react";
import type { ClientLocation } from "@/lib/game-types";
import { HINT_COST } from "@/lib/game-types";
import { cn } from "@/lib/utils";
import { PhotoSlot } from "@/components/game/photo-slot";
import { Button } from "@/components/ui/button";

type ActionState = "pending" | "reviewed" | "clue";

export function EscenaSection({
  locations,
  doneActions,
  foundActionIds,
  pending,
  onAction,
  actionFeedback,
  coins,
  cluesFound,
  totalClues,
  onBuyHint,
}: {
  locations: ClientLocation[];
  doneActions: Set<string>;
  foundActionIds: Set<string>;
  pending: boolean;
  onAction: (actionId: string) => void;
  actionFeedback: Record<string, string>;
  coins: number;
  cluesFound: number;
  totalClues: number;
  onBuyHint: () => void;
}) {
  const [activeLocationId, setActiveLocationId] = React.useState(locations[0]?.id ?? null);
  const [lastActionId, setLastActionId] = React.useState<string | null>(null);
  const active = locations.find((l) => l.id === activeLocationId) ?? null;

  function stateOf(actionId: string): ActionState {
    if (foundActionIds.has(actionId)) return "clue";
    if (doneActions.has(actionId)) return "reviewed";
    return "pending";
  }

  return (
    <div className="animate-fade-up">
      <p className="mb-4 text-sm text-ink-dim">Explorá cada punto de la escena y encontrá nuevas pistas.</p>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {locations.map((loc) => (
          <button
            key={loc.id}
            onClick={() => setActiveLocationId(loc.id)}
            className={cn(
              "shrink-0 border px-4 py-2 font-mono-tag text-[11px] transition-colors cursor-pointer",
              activeLocationId === loc.id
                ? "border-gold/60 bg-gold-dim/30 text-gold-soft"
                : "border-hairline-strong text-ink-dim hover:border-hairline-strong hover:text-ink",
            )}
          >
            {loc.name.toUpperCase()}
          </button>
        ))}
      </div>

      {active && (
        <div className="mt-4 border border-hairline-strong bg-panel">
          <div className="relative min-h-[160px] border-b border-hairline-strong sm:min-h-[200px]">
            <PhotoSlot
              src={`/images/locations/${active.key}.jpg`}
              alt={active.name}
              className="absolute inset-0"
              fallback={
                <div className="paper-texture flex h-full items-center justify-center bg-gradient-to-br from-panel-3 to-void" />
              }
            />
            <div className="relative flex min-h-[160px] flex-col items-center justify-center gap-2 bg-gradient-to-t from-void/90 via-void/10 to-transparent p-6 text-center sm:min-h-[200px]">
              <span className="font-display text-lg text-ink drop-shadow">{active.name}</span>
              <p className="max-w-md text-sm text-ink-dim drop-shadow">{active.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 divide-y divide-hairline sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
            {active.actions.map((action) => {
              const state = stateOf(action.id);
              return (
                <button
                  key={action.id}
                  disabled={pending}
                  onClick={() => {
                    setLastActionId(action.id);
                    onAction(action.id);
                  }}
                  className="group flex items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-panel-2 disabled:opacity-60 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <HotspotDot state={state} />
                    <span className="text-sm text-ink">{action.label}</span>
                  </div>
                  <StatusTag state={state} />
                </button>
              );
            })}
          </div>

          {lastActionId && actionFeedback[lastActionId] && (
            <div className="border-t border-hairline bg-panel-2 p-4 animate-fade-up">
              <span className="font-mono-tag text-[10px] text-ink-faint">
                {active.actions.find((a) => a.id === lastActionId)?.label.toUpperCase()}
              </span>
              <p className="mt-1 text-sm leading-relaxed text-ink-dim">
                {actionFeedback[lastActionId]}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3 border border-hairline-strong bg-panel px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-gold/40 bg-gold-dim/30 text-gold-soft">
            <Coins size={16} />
          </span>
          <div className="flex flex-col">
            <span className="font-mono-tag text-[10px] text-ink-faint">GABINETE DE APOYO</span>
            <p className="text-xs text-ink-dim sm:text-sm">
              Revelá una pista del caso por {HINT_COST} monedas.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="font-mono-tag text-[10px] text-ink-faint">
            {coins} <Coins size={12} className="inline text-gold" /> · {cluesFound}/{totalClues}
          </span>
          {cluesFound >= totalClues ? (
            <span className="font-mono-tag text-[10px] text-ink-faint">
              TODAS LAS PISTAS DESCUBIERTAS
            </span>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              disabled={pending || coins < HINT_COST}
              onClick={onBuyHint}
              className="normal-case"
            >
              <Eye size={13} />
              {coins < HINT_COST ? `Faltan ${HINT_COST - coins} monedas` : `Comprar pista · ${HINT_COST}`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function HotspotDot({ state }: { state: ActionState }) {
  if (state === "clue") {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-dim text-gold-soft">
        <Sparkles size={13} />
      </span>
    );
  }
  if (state === "reviewed") {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-panel-3 text-ink-faint">
        <CheckCircle2 size={13} />
      </span>
    );
  }
  return (
    <span className="relative flex h-6 w-6 items-center justify-center rounded-full border border-blood-bright/60 text-blood-bright">
      <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-blood-bright/20" />
      <Search size={12} />
    </span>
  );
}

function StatusTag({ state }: { state: ActionState }) {
  const label = state === "clue" ? "PISTA ENCONTRADA" : state === "reviewed" ? "REVISADO" : "SIN REVISAR";
  const tone =
    state === "clue" ? "text-gold-soft" : state === "reviewed" ? "text-ink-faint" : "text-blood-bright";
  return <span className={cn("shrink-0 font-mono-tag text-[10px]", tone)}>{label}</span>;
}
