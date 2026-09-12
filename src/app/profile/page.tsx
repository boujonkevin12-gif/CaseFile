import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/game/app-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, ProgressBar, SectionLabel } from "@/components/ui/badge";
import { xpProgress } from "@/lib/xp";
import { formatTime } from "@/lib/utils";
import * as Icons from "lucide-react";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const [investigationsCount, achievements, earned] = await Promise.all([
    prisma.investigation.count({ where: { userId: user.id } }),
    prisma.achievement.findMany(),
    prisma.userAchievement.findMany({ where: { userId: user.id } }),
  ]);

  const earnedIds = new Set(earned.map((e) => e.achievementId));
  const totalAttempts = user.casesSolved + user.casesFailed;
  const accuracy = totalAttempts > 0 ? Math.round((user.casesSolved / totalAttempts) * 100) : 0;
  const progress = xpProgress(user.xp);

  const stats: Array<[string, string]> = [
    ["Casos investigados", `${investigationsCount}`],
    ["Casos resueltos", `${user.casesSolved}`],
    ["Casos fallidos", `${user.casesFailed}`],
    ["Precisión", `${accuracy}%`],
    ["Mejor tiempo", user.bestTimeSecs ? formatTime(user.bestTimeSecs) : "—"],
    ["Racha actual", `${user.currentStreak}`],
  ];

  return (
    <main className="flex flex-1 flex-col">
      <AppHeader username={user.username} level={user.level} />

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
        <Card>
          <CardContent className="flex flex-col gap-4">
            <div>
              <span className="font-mono-tag text-[11px] text-ink-faint">DETECTIVE</span>
              <h1 className="font-display text-3xl text-ink">{user.username}</h1>
            </div>
            <div className="flex items-center gap-4">
              <ProgressBar value={progress.percent} className="flex-1" />
              <span className="font-mono-tag text-xs text-ink-faint shrink-0">
                Nivel {user.level} · {user.xp} XP · ${user.coins}
              </span>
            </div>
          </CardContent>
        </Card>

        <section>
          <SectionLabel>ESTADÍSTICAS</SectionLabel>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {stats.map(([label, value]) => (
              <Card key={label}>
                <CardContent className="flex flex-col gap-1 py-4">
                  <span className="font-display text-xl text-ink">{value}</span>
                  <span className="font-mono-tag text-[10px] text-ink-faint">{label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <SectionLabel>LOGROS</SectionLabel>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {achievements.map((a) => {
              const unlocked = earnedIds.has(a.id);
              const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[a.icon] ?? Icons.Award;
              return (
                <Card key={a.id} className={unlocked ? "" : "opacity-40"}>
                  <CardContent className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-hairline-strong bg-panel-3">
                      <Icon size={18} className={unlocked ? "text-gold" : "text-ink-faint"} strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-ink">{a.title}</span>
                      <span className="text-xs text-ink-faint">{a.description}</span>
                    </div>
                    {unlocked && <Badge tone="gold" className="ml-auto">OK</Badge>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
