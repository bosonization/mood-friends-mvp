import { TransitionLink } from "@/components/TransitionLink";

type DailyNoriCardProps = {
  todayDone: boolean;
  streak: number;
  moodLabel?: string | null;
  moodIcon?: string | null;
  stealthActive?: boolean;
};

export function DailyNoriCard({ todayDone, streak, moodLabel, moodIcon, stealthActive }: DailyNoriCardProps) {
  const completed = todayDone && !stealthActive;

  return (
    <section className="overflow-hidden rounded-[1.8rem] border border-white/70 bg-[radial-gradient(circle_at_0%_0%,rgba(16,185,129,0.18),transparent_34%),rgba(255,255,255,0.86)] p-4 shadow-sm backdrop-blur-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-800">Daily Nori</p>
            <span className="rounded-full bg-stone-950 px-2.5 py-1 text-[10px] font-black text-white">{Math.max(streak, 0)}日 Rhythm</span>
          </div>
          <h2 className="mt-1 text-xl font-black text-stone-950">
            {completed ? "今日のノリ、Drop済み" : stealthActive ? "今日はまだDaily未完了" : "今日のノリをDropしよう"}
          </h2>
          <p className="mt-1 text-sm leading-6 text-stone-600">
            {completed
              ? `${moodIcon ?? ""} ${moodLabel ?? "今のノリ"} で今日のNori Rhythmに入りました。`
              : "1日1回のDropで、NoriDropを見る理由をつくります。"}
          </p>
        </div>

        {completed ? (
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[1.35rem] bg-gradient-to-br from-emerald-900 to-emerald-600 text-3xl text-white shadow-lg shadow-emerald-100">✓</div>
        ) : (
          <TransitionLink href="/mood" className="shrink-0 rounded-2xl bg-gradient-to-r from-[#063f2e] via-[#0b6b47] to-[#12915f] px-5 py-3 text-center text-sm font-black text-white shadow-lg shadow-emerald-100">
            Dropする
          </TransitionLink>
        )}
      </div>
    </section>
  );
}
