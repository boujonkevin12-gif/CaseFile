import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(totalSecs: number) {
  const m = Math.floor(totalSecs / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(totalSecs % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}
