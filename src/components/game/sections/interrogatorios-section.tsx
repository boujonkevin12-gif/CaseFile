"use client";

import * as React from "react";
import { Check, Lock, MessageCircle, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import type { ClientSuspect, ClientSuspectDialogue } from "@/lib/game-types";
import { Button } from "@/components/ui/button";
import { runDialogueOption } from "@/app/actions/case-actions";
import { cn } from "@/lib/utils";

const kindIcon: Record<string, typeof MessageCircle> = {
  PREGUNTAR: MessageCircle,
  MOSTRAR_EVIDENCIA: ShieldAlert,
  ACUSAR_CONTRADICCION: ShieldAlert,
  CONTINUAR: MessageCircle,
};

type ChatMsg =
  | { id: string; role: "player"; kind: string; text: string }
  | { id: string; role: "suspect"; text: string }
  | { id: string; role: "typing" };

function SuspectAvatar({ suspect, size = "sm" }: { suspect: ClientSuspect; size?: "sm" | "md" }) {
  const dims = size === "md" ? "h-9 w-9 text-sm" : "h-7 w-7 text-[11px]";
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-display text-ink",
        dims,
      )}
      style={{ backgroundColor: suspect.avatarColor }}
    >
      {suspect.name[0]}
    </div>
  );
}

function ChatBubble({ msg, suspect }: { msg: ChatMsg; suspect: ClientSuspect }) {
  if (msg.role === "player") {
    const Icon = kindIcon[msg.kind] ?? null;
    const isConfrontation = msg.kind === "MOSTRAR_EVIDENCIA" || msg.kind === "ACUSAR_CONTRADICCION";
    return (
      <div className="flex w-full justify-end animate-fade-up">
        <div className="flex max-w-[80%] flex-col items-end gap-1">
          <span className="flex items-center gap-1 font-mono-tag text-[10px] tracking-wide text-gold-soft/90">
            {Icon && isConfrontation && <Icon size={11} />}
            INVESTIGADOR
          </span>
          <div className="rounded-md rounded-tr-none border border-blood-bright/40 bg-blood-dim/40 px-3.5 py-2.5 text-sm leading-relaxed text-ink shadow-[0_1px_0_rgba(0,0,0,0.4)]">
            {msg.text}
          </div>
        </div>
      </div>
    );
  }

  if (msg.role === "typing") {
    return (
      <div className="flex w-full items-end gap-2 animate-fade-up">
        <SuspectAvatar suspect={suspect} />
        <div className="flex flex-col items-start gap-1">
          <span className="font-mono-tag text-[10px] tracking-wide text-ink-faint">
            {suspect.name.toUpperCase()}
          </span>
          <div className="flex items-center gap-1.5 rounded-md rounded-tl-none border border-hairline-strong bg-panel-2 px-3.5 py-3">
            <span className="h-1.5 w-1.5 rounded-full bg-ink-faint animate-pulse-dot" />
            <span
              className="h-1.5 w-1.5 rounded-full bg-ink-faint animate-pulse-dot"
              style={{ animationDelay: "0.2s" }}
            />
            <span
              className="h-1.5 w-1.5 rounded-full bg-ink-faint animate-pulse-dot"
              style={{ animationDelay: "0.4s" }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full items-end gap-2 animate-fade-up">
      <SuspectAvatar suspect={suspect} />
      <div className="flex max-w-[80%] flex-col items-start gap-1">
        <span className="font-mono-tag text-[10px] tracking-wide text-ink-dim">
          {suspect.name.toUpperCase()}
        </span>
        <div className="rounded-md rounded-tl-none border border-hairline-strong border-l-2 border-l-gold/40 bg-panel-2 px-3.5 py-2.5 text-sm leading-relaxed text-ink">
          {msg.text}
        </div>
      </div>
    </div>
  );
}

export function InterrogatoriosSection({
  investigationId,
  suspects,
  dialogues,
  discoveredClueIds,
  activeSuspectId,
  onSelectSuspect,
  answeredResponses,
  onAnswered,
}: {
  investigationId: string;
  suspects: ClientSuspect[];
  dialogues: ClientSuspectDialogue[];
  discoveredClueIds: Set<string>;
  activeSuspectId: string | null;
  onSelectSuspect: (id: string) => void;
  answeredResponses: Record<string, string>;
  onAnswered: (optionId: string, text: string) => void;
}) {
  const [pending, startTransition] = React.useTransition();
  const [inflight, setInflight] = React.useState<Record<string, string>>({});
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const suspect = suspects.find((s) => s.id === activeSuspectId) ?? suspects[0];
  const dialogue = dialogues.find((d) => d.suspectId === suspect?.id) ?? null;

  const allOptions = React.useMemo(
    () => dialogue?.questions.flatMap((q) => q.options) ?? [],
    [dialogue],
  );

  const history: ChatMsg[] = React.useMemo(() => {
    const list: ChatMsg[] = [];
    for (const [optionId, responseText] of Object.entries(answeredResponses)) {
      const opt = allOptions.find((o) => o.id === optionId);
      if (!opt) continue;
      list.push({ id: `p-${optionId}`, role: "player", kind: opt.kind, text: opt.label });
      list.push({ id: `s-${optionId}`, role: "suspect", text: responseText });
    }
    return list;
  }, [answeredResponses, allOptions]);

  const transient: ChatMsg[] = React.useMemo(() => {
    const owned = new Set(allOptions.map((o) => o.id));
    const list: ChatMsg[] = [];
    for (const [optionId, playerText] of Object.entries(inflight)) {
      if (!owned.has(optionId) || answeredResponses[optionId]) continue;
      const kind = allOptions.find((o) => o.id === optionId)?.kind ?? "PREGUNTAR";
      list.push({ id: `tp-${optionId}`, role: "player", kind, text: playerText });
      list.push({ id: `tt-${optionId}`, role: "typing" });
    }
    return list;
  }, [inflight, answeredResponses, allOptions]);

  const timeline = React.useMemo(() => [...history, ...transient], [history, transient]);

  const lastMsgId = timeline[timeline.length - 1]?.id;
  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [lastMsgId, suspect?.id]);

  const answered = allOptions.filter((o) => answeredResponses[o.id]);
  const remainingGroups = React.useMemo(
    () =>
      (dialogue?.questions ?? [])
        .map((q) => ({ ...q, options: q.options.filter((o) => !answeredResponses[o.id]) }))
        .filter((q) => q.options.length > 0),
    [dialogue, answeredResponses],
  );

  function handleOption(optionId: string, playerText: string) {
    if (pending || inflight[optionId]) return;
    startTransition(async () => {
      setInflight((prev) => ({ ...prev, [optionId]: playerText }));
      try {
        const result = await runDialogueOption(investigationId, optionId);
        onAnswered(optionId, result.responseText);
      } catch {
        toast.error("Necesitás esa evidencia antes de poder mostrarla.");
      } finally {
        setInflight((prev) => {
          const next = { ...prev };
          delete next[optionId];
          return next;
        });
      }
    });
  }

  return (
    <div className="animate-fade-up grid grid-cols-1 gap-0 border border-hairline-strong lg:grid-cols-[220px_1fr]">
      <div className="flex flex-row overflow-x-auto border-b border-hairline-strong bg-carbon lg:flex-col lg:overflow-visible lg:border-b-0 lg:border-r">
        {suspects.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelectSuspect(s.id)}
            className={cn(
              "flex shrink-0 items-center gap-3 px-4 py-3 text-left text-sm transition-colors cursor-pointer lg:shrink",
              suspect?.id === s.id ? "bg-panel-2 text-gold-soft" : "text-ink-dim hover:bg-panel-2/50",
            )}
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-display text-ink"
              style={{ backgroundColor: s.avatarColor }}
            >
              {s.name[0]}
            </div>
            <span className="whitespace-nowrap lg:whitespace-normal">{s.name}</span>
          </button>
        ))}
      </div>

      <div className="flex h-[64vh] min-h-[420px] flex-col bg-panel lg:h-[640px]">
        {suspect && (
          <div className="flex items-center gap-3 border-b border-hairline px-5 py-3.5">
            <SuspectAvatar suspect={suspect} size="md" />
            <div className="flex flex-col">
              <span className="font-display text-lg leading-tight text-ink">{suspect.name}</span>
              <span className="font-mono-tag text-[10px] tracking-wide text-ink-faint">
                SOSPECHOSO EN DECLARACIÓN
              </span>
            </div>
          </div>
        )}

        <div
          ref={scrollRef}
          className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto scrollbar-thin px-4 py-5 sm:px-6"
        >
          {!dialogue || dialogue.questions.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-1.5 text-center">
              <p className="font-display text-ink-dim">
                {suspect?.name.split(" ")[0]} no tiene más para decir por ahora.
              </p>
            </div>
          ) : timeline.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full font-display text-xl text-ink"
                style={{ backgroundColor: suspect?.avatarColor }}
              >
                {suspect?.name[0]}
              </div>
              <p className="font-display text-lg text-ink-dim">Sala de interrogatorio</p>
              <p className="max-w-xs text-xs leading-relaxed text-ink-faint">
                Elegí una pregunta de abajo para comenzar la declaración de{" "}
                {suspect?.name.split(" ")[0]}.
              </p>
            </div>
          ) : (
            suspect &&
            timeline.map((msg) => <ChatBubble key={msg.id} msg={msg} suspect={suspect} />)
          )}
        </div>

        <div className="max-h-[46%] overflow-y-auto scrollbar-thin border-t border-hairline bg-carbon/50">
          {dialogue && dialogue.questions.length > 0 ? (
            <>
              <div className="flex items-center justify-between px-4 pb-2 pt-3">
                <span className="flex items-center gap-1.5 font-mono-tag text-[10px] tracking-wide text-ink-faint">
                  <span className="h-1.5 w-1.5 rounded-full bg-blood-bright animate-pulse-dot" />
                  PREGUNTAS DISPONIBLES
                </span>
                <span className="font-mono-tag text-[10px] text-ink-faint">
                  {answered.length}/{allOptions.length} RESPONDIDAS
                </span>
              </div>
              <div className="flex flex-col gap-3 px-4 pb-4">
                {remainingGroups.length === 0 ? (
                  <p className="text-xs italic text-ink-faint">
                    No quedan preguntas. {suspect?.name.split(" ")[0]} ha dicho todo lo que sabe.
                  </p>
                ) : (
                  remainingGroups.map((q) => (
                    <div key={q.id} className="flex flex-col gap-2">
                      <span className="font-mono-tag text-[10px] text-ink-dim">{q.question}</span>
                      <div className="flex flex-wrap gap-2">
                        {q.options.map((opt) => {
                          const locked =
                            Boolean(opt.requiresClueId) &&
                            !discoveredClueIds.has(opt.requiresClueId!);
                          const Icon = kindIcon[opt.kind] ?? MessageCircle;
                          return (
                            <Button
                              key={opt.id}
                              variant={opt.kind === "ACUSAR_CONTRADICCION" ? "primary" : "secondary"}
                              size="sm"
                              disabled={locked || pending || Boolean(inflight[opt.id])}
                              onClick={() => handleOption(opt.id, opt.label)}
                              className="normal-case"
                            >
                              {locked ? <Lock size={13} /> : <Icon size={13} />}
                              {opt.label}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}

                {answered.length > 0 && (
                  <div className="mt-1 border-t border-hairline pt-3">
                    <span className="font-mono-tag text-[10px] tracking-wide text-ink-faint">
                      YA UTILIZADAS
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {answered.map((o) => (
                        <span
                          key={o.id}
                          className="inline-flex items-center gap-1 rounded-sm border border-hairline bg-panel-2/60 px-2 py-0.5 text-[11px] text-ink-faint"
                        >
                          <Check size={10} className="text-gold" />
                          {o.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="px-4 py-4 text-sm text-ink-dim">
              {suspect?.name.split(" ")[0]} no tiene más para decir por ahora.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}