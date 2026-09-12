"use client";

import { FileWarning, Fingerprint, ArrowRight } from "lucide-react";
import type { CaseInfo } from "@/lib/game-types";
import { ProgressBar } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PhotoSlot } from "@/components/game/photo-slot";
import { slugify } from "@/lib/slug";

export function ExpedienteSection({
  caseInfo,
  cluesFound,
  onContinue,
}: {
  caseInfo: CaseInfo;
  cluesFound: number;
  onContinue: () => void;
}) {
  const pct = caseInfo.totalClues > 0 ? Math.round((cluesFound / caseInfo.totalClues) * 100) : 0;

  return (
    <div className="animate-fade-up">
      <div className="relative overflow-hidden border border-hairline bg-carbon">
        <div className="relative">
          <PhotoSlot
            src={`/images/cases/${slugify(caseInfo.code)}.jpg`}
            alt={caseInfo.title}
            className="h-48 border-b border-hairline-strong sm:h-64"
            fallback={
              <div className="paper-texture relative flex h-48 items-center justify-center border-b border-hairline-strong bg-gradient-to-br from-panel-3 via-carbon to-void sm:h-64">
                <Fingerprint size={72} strokeWidth={0.6} className="text-ink-faint/30" />
              </div>
            }
          />
          <span className="absolute bottom-3 right-4 rotate-[-6deg] border border-blood-bright/50 bg-void/70 px-2 py-0.5 font-mono-tag text-[10px] text-blood-bright">
            EXPEDIENTE CONFIDENCIAL
          </span>
        </div>

        <div className="flex flex-col gap-4 p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono-tag text-xs text-ink-faint">{caseInfo.code}</span>
            <span className="flex items-center gap-1.5 border border-blood-bright/50 bg-blood-dim/40 px-2 py-0.5 text-[11px] font-mono-tag text-red-200">
              <FileWarning size={12} />
              INVESTIGACIÓN ABIERTA
            </span>
          </div>

          <h1 className="font-display text-3xl leading-tight text-ink sm:text-4xl">
            {caseInfo.title}
          </h1>

          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-dim">
            <span>{caseInfo.place}</span>
            <span className="text-ink-faint">·</span>
            <span>Víctima: {caseInfo.victimName}, {caseInfo.victimAge} · {caseInfo.victimJob}</span>
            <span className="text-ink-faint">·</span>
            <span>{caseInfo.timeOfCrime} hs</span>
          </div>

          <div className="mt-2 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink-dim">
                {cluesFound}/{caseInfo.totalClues} pistas descubiertas
              </span>
              <span className="font-mono-tag text-ink-faint">{pct}%</span>
            </div>
            <ProgressBar value={pct} />
          </div>

          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-dim">{caseInfo.intro}</p>

          <Button variant="primary" size="lg" className="mt-2 w-fit uppercase" onClick={onContinue}>
            Continuar investigación
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
