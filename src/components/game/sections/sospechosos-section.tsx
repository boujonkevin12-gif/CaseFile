"use client";

import * as React from "react";
import { ArrowLeft, ChevronRight, MapPin } from "lucide-react";
import type { ClientClue, ClientLocation, ClientSuspect, ClientSuspectDialogue } from "@/lib/game-types";
import { ClueIcon } from "@/components/game/clue-icon";
import { Badge, ProgressBar } from "@/components/ui/badge";
import { suspicionLevel, suspicionPercent, suspicionTone } from "@/lib/suspicion";
import { PhotoSlot } from "@/components/game/photo-slot";
import { slugify } from "@/lib/slug";

function SuspectAvatar({ suspect, size }: { suspect: ClientSuspect; size: "sm" | "lg" }) {
  const dims = size === "lg" ? "h-16 w-16 text-2xl" : "h-14 w-14 text-xl";
  return (
    <PhotoSlot
      src={`/images/suspects/${slugify(suspect.name)}.jpg`}
      alt={suspect.name}
      className={`shrink-0 rounded-full ${dims}`}
      fallback={
        <div
          className={`flex h-full w-full items-center justify-center font-display text-ink ${dims}`}
          style={{ backgroundColor: suspect.avatarColor }}
        >
          {suspect.name[0]}
        </div>
      }
    />
  );
}

export function SospechososSection({
  suspects,
  clues,
  locations,
  dialogues,
  answeredResponses,
  onInterrogate,
}: {
  suspects: ClientSuspect[];
  clues: ClientClue[];
  locations: ClientLocation[];
  dialogues: ClientSuspectDialogue[];
  answeredResponses: Record<string, string>;
  onInterrogate: (suspectId: string) => void;
}) {
  const [selected, setSelected] = React.useState<ClientSuspect | null>(null);

  if (selected) {
    const linked = clues.filter((c) => c.implicatesSuspectId === selected.id);
    const level = suspicionLevel(selected.id, clues);
    const dialogue = dialogues.find((d) => d.suspectId === selected.id);
    const contradictionOptions =
      dialogue?.questions.flatMap((q) => q.options.filter((o) => o.kind === "ACUSAR_CONTRADICCION")) ?? [];
    const declarations = (dialogue?.questions.flatMap((q) => q.options) ?? [])
      .filter((o) => answeredResponses[o.id])
      .map((o) => answeredResponses[o.id]);
    const lastLinkedLocation = linked
      .map((c) => locations.find((l) => l.key === c.locationKey)?.name)
      .filter(Boolean)[0];

    return (
      <div className="animate-fade-up">
        <button
          onClick={() => setSelected(null)}
          className="mb-4 flex items-center gap-2 text-xs text-ink-faint hover:text-ink cursor-pointer"
        >
          <ArrowLeft size={14} />
          SOSPECHOSO
        </button>

        <div className="border border-hairline-strong bg-panel p-6">
          <div className="flex items-center gap-4 border-b border-hairline pb-5">
            <SuspectAvatar suspect={selected} size="lg" />
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-2xl text-ink">{selected.name}</h2>
              <span className="text-sm text-ink-dim">
                {selected.age} años · {selected.job}
              </span>
              <Badge tone={suspicionTone[level]} className="w-fit">
                Sospecha {level.toLowerCase()}
              </Badge>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-1">
            <ProgressBar value={suspicionPercent[level]} />
          </div>

          <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="font-mono-tag text-[10px] text-ink-faint">RELACIÓN CON LA VÍCTIMA</dt>
              <dd className="text-sm text-ink-dim">{selected.relationship}</dd>
            </div>
            <div>
              <dt className="font-mono-tag text-[10px] text-ink-faint">COARTADA / PERFIL</dt>
              <dd className="text-sm text-ink-dim">{selected.bio}</dd>
            </div>
            {lastLinkedLocation && (
              <div>
                <dt className="font-mono-tag text-[10px] text-ink-faint">VINCULADO A</dt>
                <dd className="flex items-center gap-1 text-sm text-ink-dim">
                  <MapPin size={12} className="text-gold" />
                  {lastLinkedLocation}
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-5 border-t border-hairline pt-4">
            <span className="font-mono-tag text-[10px] text-ink-faint">EVIDENCIAS RELACIONADAS</span>
            {linked.length === 0 ? (
              <p className="mt-2 text-xs text-ink-faint">Ninguna evidencia lo vincula todavía.</p>
            ) : (
              <ul className="mt-2 flex flex-col gap-2">
                {linked.map((c) => (
                  <li key={c.id} className="flex items-center gap-2 text-sm text-ink-dim">
                    <ClueIcon name={c.icon} size={14} className="text-gold" />
                    {c.title}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {contradictionOptions.length > 0 && (
            <div className="mt-5 border-t border-hairline pt-4">
              <span className="font-mono-tag text-[10px] text-ink-faint">POSIBLES CONTRADICCIONES</span>
              <ul className="mt-2 flex flex-col gap-1">
                {contradictionOptions.map((o) => (
                  <li key={o.id} className="text-sm text-ink-dim">
                    {answeredResponses[o.id] ? (
                      <span className="text-gold-soft">✓ {o.label} — confrontado</span>
                    ) : (
                      <span>· {o.label} (sin confrontar)</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {declarations.length > 0 && (
            <div className="mt-5 border-t border-hairline pt-4">
              <span className="font-mono-tag text-[10px] text-ink-faint">DECLARACIONES</span>
              <ul className="mt-2 flex flex-col gap-2">
                {declarations.map((d, i) => (
                  <li key={i} className="border-l-2 border-hairline-strong pl-3 text-sm italic text-ink-dim">
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={() => onInterrogate(selected.id)}
            className="mt-6 flex w-fit items-center gap-2 border border-blood-bright/50 bg-blood-dim/30 px-4 py-2 text-sm text-red-100 hover:bg-blood-dim/50 cursor-pointer"
          >
            Ir al interrogatorio
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 animate-fade-up">
      {suspects.map((s) => {
        const level = suspicionLevel(s.id, clues);
        return (
          <button
            key={s.id}
            onClick={() => setSelected(s)}
            className="flex items-center gap-4 border border-hairline-strong bg-panel p-4 text-left transition-colors hover:border-gold/40 cursor-pointer"
          >
            <SuspectAvatar suspect={s} size="sm" />
            <div className="flex flex-1 flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-display text-lg text-ink">{s.name}</span>
                <ChevronRight size={16} className="text-ink-faint" />
              </div>
              <span className="text-xs text-ink-dim">
                {s.age} años · {s.job}
              </span>
              <span className="text-xs text-ink-faint">{s.relationship}</span>
              <div className="mt-1 flex items-center gap-2">
                <ProgressBar value={suspicionPercent[level]} className="max-w-[120px]" />
                <Badge tone={suspicionTone[level]}>Sospecha {level.toLowerCase()}</Badge>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
