import type { ClientClue } from "@/lib/game-types";

export type SuspicionLevel = "ALTA" | "MEDIA" | "BAJA";

/**
 * Nivel de sospecha calculado SOLO a partir de pistas ya descubiertas por el jugador.
 * No usa isGuilty ni ningún dato oculto: es una lectura de la propia investigación.
 */
export function suspicionLevel(suspectId: string, discoveredClues: ClientClue[]): SuspicionLevel {
  const linked = discoveredClues.filter((c) => c.implicatesSuspectId === suspectId);
  const hasKey = linked.some((c) => c.importance === "CLAVE");
  if (hasKey || linked.length >= 2) return "ALTA";
  if (linked.length === 1) return "MEDIA";
  return "BAJA";
}

export const suspicionTone: Record<SuspicionLevel, "blood" | "gold" | "neutral"> = {
  ALTA: "blood",
  MEDIA: "gold",
  BAJA: "neutral",
};

export const suspicionPercent: Record<SuspicionLevel, number> = {
  ALTA: 85,
  MEDIA: 50,
  BAJA: 18,
};
