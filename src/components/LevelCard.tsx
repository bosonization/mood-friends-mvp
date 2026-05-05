import { ShareInviteButton } from "@/components/ShareInviteButton";
import { SubmitButton } from "@/components/SubmitButton";
import { startSpotlight } from "@/app/home/actions";
import type { LevelStatus, UserLevel } from "@/lib/level";

type LevelCardProps = {
  status: LevelStatus;
  memberCode: string;
  handleName: string;
  hasActiveMood: boolean;
  spotlightActive: boolean;
  spotlightUsedToday: boolean;
};

const stages: Record<UserLevel, { title: string; vibe: string; face: string; scale: string; glow: string }> = {
  1: { title: "赤ちゃんノリ", vibe: "まだふにゃっと準備中", face: "• ᴗ •", scale: "scale-90", glow: "from-emerald-300/30 to-lime-200/20" },
  2: { title: "よちよちノリ", vibe: "ちょっと動き出した", face: "• ◡ •", scale: "scale-95", glow: "from-cyan-300/30 to-emerald-200/20" },
  3: { title: "わんぱくノリ", vibe: "ノリが育ってきた", face: "•̀ ᴗ •́", scale: "scale-100", glow: "from-pink-300/30 to-orange-200/20" },
  4: { title: "イケノリ", vibe: "ツヤが出てきた", face: "- ᴗ -", scale: "scale-105", glow: "from-violet-300/30 to-fuchsia-200/20" },
  5: { title: "オトナノリ", vibe: "余裕のある完成形", face: "•̀ᴗ•́✧", scale: "scale-110", glow: "from-fuchsia-300/35 to-amber-200/25" }
};

const levelDots: UserLevel[] = [1, 2, 3, 4, 5];

function getLv5ButtonText({ status, hasActiveMood, spotlightActive, spotlightUsedToday }: LevelCardProps) {
  if (!status.spotlightUnlocked) return "招待1人で解放";
  if (!hasActiveMood) return "ノリ登録後に使用";
  if (spotlightActive) return "Spotlight中";
  if (spotlightUsedToday) return "今日は使用済み";
  return "Spotlightを使う";
}

function getNextUnlock(status: LevelStatus) {
  if (status.nextUnlockLabel) return status.nextUnlockLabel.replace("次に解放：", "");
  if (status.spotlightUnlocked) return "Spotlight";
  if (status.level >= 5) return "Spotlight";
  return "完成";
}

function GrowthChips({ status }: { status: LevelStatus }) {
  const items = [
    { label: "画像", done: status.avatarCompleted },
    { label: "1回", done: status.cappedNoriUpdateCount >= 1 },
    { label: "2回", done: status.cappedNoriUpdateCount >= 2 },
    { label: "3回", done: status.cappedNoriUpdateCount >= 3 }
  ];

  return (
    <div className="grid grid-cols-4 gap-1.5">
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-full border px-2.5 py-2 text-center text-[11px] font-black transition ${
            item.done
              ? "border-white/60 bg-stone-950 text-white shadow-lg shadow-stone-200"
              : "border-white/70 bg-white/55 text-stone-400"
          }`}
        >
          <span className="mr-1">{item.done ? "✓" : "○"}</span>{item.label}
        </div>
      ))}
    </div>
  );
}

function LevelRail({ level }: { level: UserLevel }) {
  return (
    <div className="flex items-center gap-1.5">
      {levelDots.map((dot) => {
        const active = level >= dot;
        const current = level === dot;
        return (
          <div
            key={dot}
            className={`rounded-full px-2.5 py-1 text-[10px] font-black transition ${
              current
                ? "bg-stone-950 text-white shadow-lg shadow-stone-300"
                : active
                  ? "bg-white/80 text-stone-900"
                  : "bg-white/35 text-stone-400"
            }`}
          >
            Lv{dot}
          </div>
        );
      })}
    </div>
  );
}

function NoriCharacter({ level }: { level: UserLevel }) {
  const stage = stages[level];
  return (
    <div className="relative grid h-28 w-28 shrink-0 place-items-center">
      <div className={`absolute inset-0 rounded-[2.2rem] bg-gradient-to-br ${stage.glow} blur-xl`} />
      <div className={`relative grid h-24 w-20 place-items-center rounded-[1.55rem] border border-white/25 bg-gradient-to-br from-emerald-950 via-stone-950 to-lime-950 shadow-2xl shadow-stone-300 transition ${stage.scale}`}>
        <div className="absolute left-2 top-2 h-2 w-10 rounded-full bg-white/18" />
        <div className="absolute bottom-2 h-1.5 w-10 rounded-full bg-emerald-300/25" />
        <span className="text-center text-[13px] font-black tracking-tight text-white">{stage.face}</span>
      </div>
      <span className="absolute -right-1 -top-1 rounded-full bg-white px-2 py-1 text-[10px] font-black text-stone-950 shadow-md">Lv{level}</span>
    </div>
  );
}

export function LevelCard(props: LevelCardProps) {
  const { status, memberCode, handleName, hasActiveMood, spotlightActive, spotlightUsedToday } = props;
  const canUseSpotlight = status.spotlightUnlocked && hasActiveMood && !spotlightActive && !spotlightUsedToday;
  const stage = stages[status.level];
  const nextUnlock = getNextUnlock(status);

  if (status.level >= 5 && status.spotlightUnlocked) {
    return (
      <section className="overflow-hidden rounded-[1.8rem] border border-fuchsia-100 bg-[radial-gradient(circle_at_0%_0%,rgba(217,70,239,0.22),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.9),rgba(255,255,255,0.68))] p-4 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-fuchsia-700">Spotlight Ready</p>
              <span className="rounded-full bg-stone-950 px-2.5 py-1 text-[10px] font-black text-white">Lv5</span>
            </div>
            <h2 className="mt-1 text-xl font-black text-stone-950">特別なノリを光らせる</h2>
            <p className="mt-1 text-xs leading-5 text-stone-600">NORI LIFEは完成。Spotlightだけをシンプルに使えます。</p>
          </div>
          <form action={startSpotlight} className="shrink-0 sm:w-[190px]">
            <SubmitButton
              disabled={!canUseSpotlight}
              pendingText="発動中..."
              className="w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 to-violet-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-fuchsia-100 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {getLv5ButtonText(props)}
            </SubmitButton>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-[radial-gradient(circle_at_8%_0%,rgba(255,255,255,0.95),transparent_30%),radial-gradient(circle_at_92%_12%,rgba(236,72,153,0.16),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.86),rgba(255,255,255,0.66))] p-4 shadow-sm backdrop-blur-xl">
      <div className="grid gap-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <div className="flex items-center gap-3">
          <NoriCharacter level={status.level} />
          <div className="min-w-0 lg:hidden">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-pink-600">NORI LIFE</p>
            <h2 className="mt-1 text-2xl font-black">{stage.title}</h2>
            <p className="mt-1 text-xs font-bold text-stone-500">{stage.vibe}</p>
          </div>
        </div>

        <div className="min-w-0">
          <div className="hidden lg:block">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-pink-600">NORI LIFE</p>
            <h2 className="mt-1 text-2xl font-black">{stage.title}</h2>
            <p className="mt-1 text-xs font-bold text-stone-500">{stage.vibe}</p>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 lg:mt-4">
            <LevelRail level={status.level} />
            <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-black text-stone-600 shadow-sm">次：{nextUnlock}</span>
            {status.level >= 5 && !status.spotlightUnlocked ? (
              <span className="rounded-full bg-fuchsia-50 px-3 py-1 text-[11px] font-black text-fuchsia-700">招待でSpotlight</span>
            ) : null}
          </div>

          <div className="mt-3 max-w-md">
            <GrowthChips status={status} />
          </div>
        </div>

        <div className="flex flex-col gap-2 lg:min-w-[190px]">
          {status.spotlightUnlocked ? (
            <form action={startSpotlight}>
              <SubmitButton
                disabled={!canUseSpotlight}
                pendingText="発動中..."
                className="w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 to-violet-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-fuchsia-100 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {getLv5ButtonText(props)}
              </SubmitButton>
            </form>
          ) : status.level >= 5 ? (
            <ShareInviteButton memberCode={memberCode} handleName={handleName} />
          ) : (
            <div className="rounded-2xl border border-white/70 bg-white/60 px-4 py-3 text-sm font-black text-stone-700 shadow-sm">
              {status.nextActionLabel}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
