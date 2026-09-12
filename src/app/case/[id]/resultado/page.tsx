import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/game/app-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClueIcon } from "@/components/game/clue-icon";
import { formatTime } from "@/lib/utils";
import { InvestigationStatus } from "@prisma/client";
import { beginCase } from "@/app/actions/case-actions";
import { Fingerprint } from "lucide-react";
import { PhotoSlot } from "@/components/game/photo-slot";
import { slugify } from "@/lib/slug";

export default async function CaseResultPage({ params }: PageProps<"/case/[id]/resultado">) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const investigation = await prisma.investigation.findUnique({
    where: { id },
    include: {
      case: { include: { suspects: true, clues: true } },
      clues: { include: { clue: true } },
    },
  });

  if (!investigation || investigation.userId !== user.id) notFound();
  if (investigation.status === InvestigationStatus.EN_CURSO) redirect(`/case/${investigation.id}`);

  const correct = investigation.status === InvestigationStatus.RESUELTO;
  const guilty = investigation.case.suspects.find((s) => s.isGuilty)!;
  const totalClues = investigation.case.clues.length;
  const foundClues = investigation.clues.length;
  const accuracy = totalClues > 0 ? Math.round((foundClues / totalClues) * 100) : 0;
  const keyClue = investigation.clues.find((c) => c.clue.importance === "CLAVE")?.clue;

  return (
    <main className="flex flex-1 flex-col">
      <AppHeader username={user.username} level={user.level} caseCode={investigation.case.code} />

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6 sm:py-16">
        {/* Panel cinematográfico */}
        <div className="animate-stamp overflow-hidden border border-hairline-strong bg-carbon text-center">
          <PhotoSlot
            src={`/images/suspects/${slugify(guilty.name)}.jpg`}
            alt={guilty.name}
            className="h-40 border-b border-hairline-strong sm:h-56"
            fallback={
              <div className="paper-texture relative flex h-40 items-center justify-center border-b border-hairline-strong bg-gradient-to-br from-panel-3 via-carbon to-void sm:h-56">
                <Fingerprint size={56} strokeWidth={0.6} className="text-ink-faint/25" />
              </div>
            }
          />
          <div className="flex flex-col items-center gap-3 p-6 sm:p-10">
            <Badge tone={correct ? "green" : "blood"} className="px-3 py-1 text-xs">
              {correct ? "CASO RESUELTO" : "CASO FALLIDO"}
            </Badge>
            <h1 className="font-display text-3xl text-ink sm:text-4xl">{guilty.name}</h1>
            <p className="max-w-md text-sm leading-relaxed text-ink-dim">
              {correct
                ? investigation.case.motive
                : `El verdadero culpable era ${guilty.name}. ${investigation.case.resolutionText}`}
            </p>
            {correct && (
              <p className="mt-1 font-display text-base italic text-ink-faint">
                &ldquo;La verdad siempre deja pistas.&rdquo;
              </p>
            )}
          </div>
        </div>

        {correct && keyClue && (
          <Card>
            <CardContent className="flex items-center gap-3">
              <ClueIcon name={keyClue.icon} size={20} className="text-gold" />
              <div>
                <span className="font-mono-tag text-[10px] text-ink-faint">EVIDENCIA CLAVE</span>
                <p className="text-sm text-ink">{keyClue.title}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBox label="XP" value={`+${investigation.xpEarned}`} />
          <StatBox label="Dinero" value={`+$${investigation.coinsEarned}`} />
          <StatBox label="Tiempo" value={formatTime(investigation.timeSecs ?? 0)} />
          <StatBox label="Pistas" value={`${foundClues}/${totalClues}`} sub={`${accuracy}%`} />
        </div>

        <div className="flex justify-center">
          {correct ? (
            <Link href="/dashboard">
              <Button variant="gold" size="lg" className="uppercase">
                Ver expediente completo
              </Button>
            </Link>
          ) : (
            <form
              action={async () => {
                "use server";
                await beginCase(investigation.caseId);
              }}
            >
              <Button type="submit" variant="primary" size="lg" className="uppercase">
                Volver a intentar
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

function StatBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-1 py-4">
        <span className="font-display text-xl text-ink">{value}</span>
        <span className="font-mono-tag text-[10px] text-ink-faint">
          {label}
          {sub ? ` · ${sub}` : ""}
        </span>
      </CardContent>
    </Card>
  );
}
