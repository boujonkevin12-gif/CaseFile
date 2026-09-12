"use client";

import * as React from "react";
import { toast } from "sonner";
import { runLocationAction, buyClueHint } from "@/app/actions/case-actions";
import type {
  CaseInfo,
  ClientClue,
  ClientLocation,
  ClientSuspect,
  ClientSuspectDialogue,
} from "@/lib/game-types";
import { CaseNav, type CaseSection } from "@/components/game/case-nav";
import { ExpedienteSection } from "@/components/game/sections/expediente-section";
import { EvidenciasSection } from "@/components/game/sections/evidencias-section";
import { SospechososSection } from "@/components/game/sections/sospechosos-section";
import { EscenaSection } from "@/components/game/sections/escena-section";
import { InterrogatoriosSection } from "@/components/game/sections/interrogatorios-section";
import { TeoriaSection } from "@/components/game/sections/teoria-section";
import { AcusarSection } from "@/components/game/sections/acusar-section";

const sectionTitles: Record<CaseSection, string> = {
  expediente: "Expediente",
  evidencias: "Evidencias",
  sospechosos: "Sospechosos",
  escena: "Escena del crimen",
  interrogatorios: "Interrogatorios",
  teoria: "Teoría del caso",
  acusar: "Acusar",
};

export function CaseBoard({
  investigationId,
  username,
  coins,
  caseInfo,
  suspects,
  locations,
  dialogues,
  initialDiscoveredClues,
}: {
  investigationId: string;
  username: string;
  coins: number;
  caseInfo: CaseInfo;
  suspects: ClientSuspect[];
  locations: ClientLocation[];
  dialogues: ClientSuspectDialogue[];
  initialDiscoveredClues: ClientClue[];
}) {
  const [section, setSection] = React.useState<CaseSection>("expediente");
  const [clues, setClues] = React.useState<ClientClue[]>(initialDiscoveredClues);
  const [coinBalance, setCoinBalance] = React.useState(coins);
  const [doneActions, setDoneActions] = React.useState<Set<string>>(new Set());
  const [foundActionIds, setFoundActionIds] = React.useState<Set<string>>(new Set());
  const [actionFeedback, setActionFeedback] = React.useState<Record<string, string>>({});
  const [reviewedClues, setReviewedClues] = React.useState<Set<string>>(new Set());
  const [answeredResponses, setAnsweredResponses] = React.useState<Record<string, string>>({});
  const [activeSuspectId, setActiveSuspectId] = React.useState<string | null>(suspects[0]?.id ?? null);
  const [pending, startTransition] = React.useTransition();

  const clueIds = React.useMemo(() => new Set(clues.map((c) => c.id)), [clues]);

  function handleAction(actionId: string) {
    startTransition(async () => {
      try {
        const result = await runLocationAction(investigationId, actionId);
        setDoneActions((prev) => new Set(prev).add(actionId));
        setActionFeedback((prev) => ({ ...prev, [actionId]: result.resultText }));
        if (result.clueDiscovered) {
          setFoundActionIds((prev) => new Set(prev).add(actionId));
          toast.success(`Nueva evidencia: ${result.clueDiscovered.title}`, {
            description: "Se agregó al expediente.",
          });
          setClues((prev) => {
            if (prev.some((c) => c.id === result.clueDiscovered!.id)) return prev;
            return [...prev, result.clueDiscovered!];
          });
        }
      } catch {
        toast.error("No se pudo completar la acción. Probá de nuevo.");
      }
    });
  }

  function handleBuyHint() {
    startTransition(async () => {
      try {
        const result = await buyClueHint(investigationId);
        setCoinBalance((prev) => prev - result.cost);
        toast.success(`Pista revelada: ${result.clue.title}`, {
          description: "Se agregó al expediente.",
        });
        setClues((prev) => {
          if (prev.some((c) => c.id === result.clue.id)) return prev;
          return [...prev, result.clue];
        });
      } catch {
        toast.error("No se pudo comprar la pista. Revisá tus monedas.");
      }
    });
  }

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <CaseNav
        active={section}
        onNavigate={setSection}
        username={username}
        cluesFound={clues.length}
        cluesTotal={caseInfo.totalClues}
      />

      <div className="flex-1 pb-20 lg:pb-0">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-8 sm:py-8">
          <div className="mb-5 hidden items-center gap-2 lg:flex">
            <span className="font-mono-tag text-[11px] text-ink-faint">{caseInfo.code}</span>
            <span className="text-ink-faint">/</span>
            <h2 className="font-display text-lg text-ink">{sectionTitles[section]}</h2>
          </div>

          {section === "expediente" && (
            <ExpedienteSection
              caseInfo={caseInfo}
              cluesFound={clues.length}
              onContinue={() => setSection("escena")}
            />
          )}

          {section === "evidencias" && (
            <EvidenciasSection
              clues={clues}
              totalClues={caseInfo.totalClues}
              locations={locations}
              reviewed={reviewedClues}
              onMarkReviewed={(id) => setReviewedClues((prev) => new Set(prev).add(id))}
            />
          )}

          {section === "sospechosos" && (
            <SospechososSection
              suspects={suspects}
              clues={clues}
              locations={locations}
              dialogues={dialogues}
              answeredResponses={answeredResponses}
              onInterrogate={(id) => {
                setActiveSuspectId(id);
                setSection("interrogatorios");
              }}
            />
          )}

          {section === "escena" && (
            <EscenaSection
              locations={locations}
              doneActions={doneActions}
              foundActionIds={foundActionIds}
              pending={pending}
              onAction={handleAction}
              actionFeedback={actionFeedback}
              coins={coinBalance}
              cluesFound={clues.length}
              totalClues={caseInfo.totalClues}
              onBuyHint={handleBuyHint}
            />
          )}

          {section === "interrogatorios" && (
            <InterrogatoriosSection
              investigationId={investigationId}
              suspects={suspects}
              dialogues={dialogues}
              discoveredClueIds={clueIds}
              activeSuspectId={activeSuspectId}
              onSelectSuspect={setActiveSuspectId}
              answeredResponses={answeredResponses}
              onAnswered={(optionId, text) =>
                setAnsweredResponses((prev) => ({ ...prev, [optionId]: text }))
              }
            />
          )}

          {section === "teoria" && <TeoriaSection suspects={suspects} clues={clues} />}

          {section === "acusar" && (
            <AcusarSection investigationId={investigationId} suspects={suspects} clues={clues} />
          )}
        </div>
      </div>
    </div>
  );
}
