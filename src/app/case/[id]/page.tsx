import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CaseBoard } from "@/components/game/case-board";
import { InvestigationStatus } from "@prisma/client";

export default async function CasePage({ params }: PageProps<"/case/[id]">) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const investigation = await prisma.investigation.findUnique({
    where: { id },
    include: {
      case: {
        include: {
          suspects: { orderBy: { order: "asc" } },
          locations: {
            orderBy: { order: "asc" },
            include: { actions: { orderBy: { order: "asc" } } },
          },
          clues: true,
        },
      },
      clues: { include: { clue: true } },
    },
  });

  if (!investigation || investigation.userId !== user.id) notFound();

  if (investigation.status !== InvestigationStatus.EN_CURSO) {
    redirect(`/case/${investigation.id}/resultado`);
  }

  const dialoguesBySuspect = await prisma.dialogue.findMany({
    where: { suspectId: { in: investigation.case.suspects.map((s) => s.id) } },
    orderBy: { order: "asc" },
    include: { options: { orderBy: { order: "asc" } } },
  });

  // --- Sanitizamos todo lo que se envía al cliente: nunca revelamos isGuilty ni resultText/clueId sin descubrir.
  const suspects = investigation.case.suspects.map((s) => ({
    id: s.id,
    name: s.name,
    age: s.age,
    job: s.job,
    relationship: s.relationship,
    bio: s.bio,
    avatarColor: s.avatarColor,
  }));

  const locations = investigation.case.locations.map((loc) => ({
    id: loc.id,
    key: loc.key,
    name: loc.name,
    description: loc.description,
    actions: loc.actions.map((a) => ({ id: a.id, label: a.label, order: a.order })),
  }));

  const discoveredClues = investigation.clues.map((ic) => ({
    id: ic.clue.id,
    title: ic.clue.title,
    description: ic.clue.description,
    icon: ic.clue.icon,
    type: ic.clue.type,
    importance: ic.clue.importance,
    implicatesSuspectId: ic.clue.implicatesSuspectId,
    locationKey: ic.clue.locationKey,
  }));

  const dialogues = investigation.case.suspects.map((s) => ({
    suspectId: s.id,
    questions: dialoguesBySuspect
      .filter((d) => d.suspectId === s.id)
      .map((d) => ({
        id: d.id,
        question: d.question,
        options: d.options.map((o) => ({
          id: o.id,
          kind: o.kind,
          label: o.label,
          requiresClueId: o.requiresClueId,
        })),
      })),
  }));

  return (
    <main className="flex flex-1 flex-col">
      <CaseBoard
        investigationId={investigation.id}
        username={user.username}
        coins={user.coins}
        caseInfo={{
          code: investigation.case.code,
          title: investigation.case.title,
          intro: investigation.case.intro,
          victimName: investigation.case.victimName,
          victimAge: investigation.case.victimAge,
          victimJob: investigation.case.victimJob,
          place: investigation.case.place,
          timeOfCrime: investigation.case.timeOfCrime,
          totalClues: investigation.case.clues.length,
        }}
        suspects={suspects}
        locations={locations}
        dialogues={dialogues}
        initialDiscoveredClues={discoveredClues}
      />
    </main>
  );
}
