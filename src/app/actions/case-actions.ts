"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import {
  startInvestigation,
  performLocationAction,
  answerDialogueOption,
  accuseSuspect,
  buyClueHint as buyClueHintLogic,
} from "@/lib/game-logic";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  return user;
}

export async function beginCase(caseId: string) {
  const user = await requireUser();
  const investigation = await startInvestigation(user.id, caseId);
  redirect(`/case/${investigation.id}`);
}

export async function runLocationAction(investigationId: string, actionId: string) {
  await requireUser();
  const result = await performLocationAction(investigationId, actionId);
  revalidatePath(`/case/${investigationId}`);
  return result;
}

export async function runDialogueOption(investigationId: string, optionId: string) {
  await requireUser();
  const result = await answerDialogueOption(investigationId, optionId);
  return result;
}

export async function buyClueHint(investigationId: string) {
  const user = await requireUser();
  return buyClueHintLogic(user.id, investigationId);
}

export async function confirmAccusation(investigationId: string, suspectId: string) {
  await requireUser();
  await accuseSuspect(investigationId, suspectId);
  revalidatePath(`/case/${investigationId}`);
  redirect(`/case/${investigationId}/resultado`);
}

export async function getInvestigationClueIds(investigationId: string) {
  await requireUser();
  const clues = await prisma.investigationClue.findMany({
    where: { investigationId },
    select: { clueId: true },
  });
  return clues.map((c) => c.clueId);
}
