import "server-only";
import { prisma } from "@/lib/prisma";
import { InvestigationStatus } from "@prisma/client";
import { levelFromTotalXp } from "@/lib/xp";
import { HINT_COST } from "@/lib/game-types";

/** Devuelve la investigación activa (o la última) de un usuario para un caso, creándola si no existe. */
export async function startInvestigation(userId: string, caseId: string) {
  const existing = await prisma.investigation.findFirst({
    where: { userId, caseId, status: InvestigationStatus.EN_CURSO },
  });
  if (existing) return existing;

  return prisma.investigation.create({
    data: { userId, caseId, status: InvestigationStatus.EN_CURSO },
  });
}

/** Ejecuta una acción de ubicación: registra la pista si corresponde y la devuelve. */
export async function performLocationAction(investigationId: string, actionId: string) {
  const investigation = await prisma.investigation.findUniqueOrThrow({
    where: { id: investigationId },
  });
  if (investigation.status !== InvestigationStatus.EN_CURSO) {
    throw new Error("Esta investigación ya terminó.");
  }

  const action = await prisma.caseLocationAction.findUniqueOrThrow({
    where: { id: actionId },
    include: { clue: true },
  });

  let clueDiscovered: {
    id: string;
    title: string;
    description: string;
    icon: string;
    type: string;
    importance: string;
    implicatesSuspectId: string | null;
    locationKey: string | null;
  } | null = null;

  if (action.clueId) {
    const already = await prisma.investigationClue.findUnique({
      where: { investigationId_clueId: { investigationId, clueId: action.clueId } },
    });
    if (!already) {
      await prisma.investigationClue.create({
        data: { investigationId, clueId: action.clueId },
      });
      if (action.clue) {
        clueDiscovered = {
          id: action.clue.id,
          title: action.clue.title,
          description: action.clue.description,
          icon: action.clue.icon,
          type: action.clue.type,
          importance: action.clue.importance,
          implicatesSuspectId: action.clue.implicatesSuspectId,
          locationKey: action.clue.locationKey,
        };
      }
    }
  }

  return { resultText: action.resultText, clueDiscovered };
}

/** Devuelve el texto de respuesta de una opción de diálogo, validando que la pista requerida exista. */
export async function answerDialogueOption(investigationId: string, optionId: string) {
  const option = await prisma.dialogueOption.findUniqueOrThrow({
    where: { id: optionId },
  });

  if (option.requiresClueId) {
    const owned = await prisma.investigationClue.findUnique({
      where: { investigationId_clueId: { investigationId, clueId: option.requiresClueId } },
    });
    if (!owned) {
      throw new Error("Necesitás encontrar esa evidencia antes de poder mostrarla.");
    }
  }

  return { responseText: option.responseText };
}

/** Vende una pista no descubierta del caso a cambio de monedas. Todo se valida server-side. */
export async function buyClueHint(userId: string, investigationId: string) {
  const investigation = await prisma.investigation.findUniqueOrThrow({
    where: { id: investigationId },
    include: { case: { include: { clues: true } }, clues: true },
  });

  if (investigation.userId !== userId) {
    throw new Error("No tenés acceso a esta investigación.");
  }
  if (investigation.status !== InvestigationStatus.EN_CURSO) {
    throw new Error("Esta investigación ya terminó.");
  }

  const owned = new Set(investigation.clues.map((c) => c.clueId));
  const hidden = investigation.case.clues.filter((c) => !owned.has(c.id));
  if (hidden.length === 0) {
    throw new Error("Ya descubriste todas las pistas de este caso.");
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (user.coins < HINT_COST) {
    throw new Error("No tenés suficientes monedas para comprar una pista.");
  }

  const chosen = hidden[Math.floor(Math.random() * hidden.length)];

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { coins: user.coins - HINT_COST } }),
    prisma.investigationClue.create({
      data: { investigationId, clueId: chosen.id },
    }),
  ]);

  return {
    cost: HINT_COST,
    clue: {
      id: chosen.id,
      title: chosen.title,
      description: chosen.description,
      icon: chosen.icon,
      type: chosen.type,
      importance: chosen.importance,
      implicatesSuspectId: chosen.implicatesSuspectId,
      locationKey: chosen.locationKey,
    },
  };
}

/** Resuelve una acusación: compara contra el sospechoso culpable (server-side, nunca expuesto antes). */
export async function accuseSuspect(investigationId: string, accusedSuspectId: string) {
  const investigation = await prisma.investigation.findUniqueOrThrow({
    where: { id: investigationId },
    include: { case: { include: { suspects: true, clues: true } }, clues: true },
  });

  if (investigation.status !== InvestigationStatus.EN_CURSO) {
    throw new Error("Esta investigación ya terminó.");
  }

  const guilty = investigation.case.suspects.find((s) => s.isGuilty);
  if (!guilty) throw new Error("Este caso no tiene un culpable configurado.");

  const correct = guilty.id === accusedSuspectId;
  const totalClues = investigation.case.clues.length;
  const foundClues = investigation.clues.length;
  const timeSecs = Math.max(1, Math.round((Date.now() - investigation.startedAt.getTime()) / 1000));

  const baseXp = investigation.case.xpReward;
  const baseCoins = investigation.case.coinReward;

  // La recompensa se calcula server-side, nunca se confía en el cliente.
  const clueRatio = totalClues > 0 ? foundClues / totalClues : 0;
  const xpEarned = correct
    ? Math.round(baseXp * (0.6 + 0.4 * clueRatio))
    : Math.round(baseXp * 0.15);
  const coinsEarned = correct
    ? Math.round(baseCoins * (0.6 + 0.4 * clueRatio))
    : Math.round(baseCoins * 0.15);

  const user = await prisma.user.findUniqueOrThrow({ where: { id: investigation.userId } });
  const newTotalXp = user.xp + xpEarned;
  const newLevel = levelFromTotalXp(newTotalXp);
  const newStreak = correct ? user.currentStreak + 1 : 0;

  await prisma.$transaction([
    prisma.investigation.update({
      where: { id: investigationId },
      data: {
        status: correct ? InvestigationStatus.RESUELTO : InvestigationStatus.FALLIDO,
        finishedAt: new Date(),
        accusedSuspectId,
        timeSecs,
        xpEarned,
        coinsEarned,
      },
    }),
    prisma.user.update({
      where: { id: investigation.userId },
      data: {
        xp: newTotalXp,
        coins: user.coins + coinsEarned,
        level: newLevel,
        casesSolved: correct ? user.casesSolved + 1 : user.casesSolved,
        casesFailed: correct ? user.casesFailed : user.casesFailed + 1,
        currentStreak: newStreak,
        bestStreak: Math.max(user.bestStreak, newStreak),
        bestTimeSecs:
          correct && (!user.bestTimeSecs || timeSecs < user.bestTimeSecs) ? timeSecs : user.bestTimeSecs,
      },
    }),
  ]);

  await grantAchievementsIfNeeded(investigation.userId);

  return {
    correct,
    guiltyName: guilty.name,
    motive: investigation.case.motive,
    resolutionText: investigation.case.resolutionText,
    xpEarned,
    coinsEarned,
    foundClues,
    totalClues,
    timeSecs,
  };
}

async function grantAchievementsIfNeeded(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const totalCluesFound = await prisma.investigationClue.count({
    where: { investigation: { userId } },
  });
  const perfectSolve = await prisma.investigation.findFirst({
    where: {
      userId,
      status: InvestigationStatus.RESUELTO,
    },
    include: { clues: true, case: { include: { clues: true } } },
  });

  const toGrant: string[] = [];
  if (user.casesSolved >= 1) toGrant.push("primer_caso");
  if (user.casesSolved >= 5) toGrant.push("cinco_casos");
  if (totalCluesFound >= 10) toGrant.push("diez_pistas");
  if (user.level >= 5) toGrant.push("detective_experto");
  if (perfectSolve && perfectSolve.clues.length >= perfectSolve.case.clues.length) {
    toGrant.push("primer_caso_perfecto");
  }

  if (toGrant.length === 0) return;

  const achievements = await prisma.achievement.findMany({ where: { key: { in: toGrant } } });
  await Promise.all(
    achievements.map((a) =>
      prisma.userAchievement.upsert({
        where: { userId_achievementId: { userId, achievementId: a.id } },
        update: {},
        create: { userId, achievementId: a.id },
      }),
    ),
  );
}

/** Se asegura de que el usuario tenga desbloqueado el primer caso disponible según su nivel. */
export async function ensureUnlockedCases(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const eligibleCases = await prisma.case.findMany({
    where: { isActive: true, requiredLevel: { lte: user.level } },
    orderBy: { order: "asc" },
  });

  const unlocks = await prisma.userCaseUnlock.findMany({ where: { userId } });
  const unlockedIds = new Set(unlocks.map((u) => u.caseId));

  const missing = eligibleCases.filter((c) => !unlockedIds.has(c.id));
  if (missing.length > 0) {
    await prisma.userCaseUnlock.createMany({
      data: missing.map((c) => ({ userId, caseId: c.id })),
      skipDuplicates: true,
    });
  }
}
