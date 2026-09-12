/**
 * Curva de nivel: cada nivel requiere un poco más de XP que el anterior.
 * Nivel 1 -> 2: 500 XP acumulados. Nivel N -> N+1: 500 * N XP acumulados extra.
 */
export function xpRequiredForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += 500 * i;
  }
  return total;
}

export function levelFromTotalXp(totalXp: number): number {
  let level = 1;
  while (totalXp >= xpRequiredForLevel(level + 1)) {
    level++;
  }
  return level;
}

export function xpProgress(totalXp: number) {
  const level = levelFromTotalXp(totalXp);
  const floor = xpRequiredForLevel(level);
  const ceil = xpRequiredForLevel(level + 1);
  const inLevel = totalXp - floor;
  const span = ceil - floor;
  return {
    level,
    inLevel,
    span,
    percent: Math.min(100, Math.round((inLevel / span) * 100)),
    toNext: ceil - totalXp,
  };
}
