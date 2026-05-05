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

const stageNames: Record<UserLevel, string> = {
  1: "赤ちゃんノリ",
  2: "よちよちノリ",
  3: "わんぱくノリ",
  4: "イケノリ",
  5: "オトナノリ"
};

const characterImages: Record<UserLevel, string> = {
  1: "/nori-level-01.png",
  2: "/nori-level-02.png",
  3: "/nori-level-03.png",
  4: "/nori-level-04.png",
  5: "/nori-level-05.png"
};

function getLv5ButtonText({ status, hasActiveMood, spotlightActive, spotlightUsedToday }: LevelCardProps) {
  const spotlightUnlocked = status.spotlightUnlocked;
  if (!spotlightUnlocked) return "招待1人で解放";
  if (!hasActiveMood) return "ノリ登録後に使用";
  if (spotlightActive) return "Spotlight中";
  if (spotlightUsedToday) return "今日は使用済み";
  return "Spotlightを使う";
}

function getMissionDone(status: LevelStatus, key: "avatar" | "nori1" | "nori2" | "nori3") {
  const avatarCompleted = status.avatarCompleted;
  const noriCount = status.cappedNoriUpdateCount;
  if (key === "avatar") return avatarCompleted;
  if (key === "nori1") return noriCount >= 1;
  if (key === "nori2") return noriCount >= 2;
  return noriCount >= 3;
}

function getNextUnlock(status: LevelStatus) {
  if (status.nextUnlockLabel) return status.nextUnlockLabel;
  if (status.level < 2) return "次に解放：ゲーム";
  if (status.level < 3) return "次に解放：外出";
  if (status.level < 4) return "次に解放：もくもく";
  if (status.level < 5) return "次に解放：何かしたい";
  return null;
}

function CharacterImage({ level }: { level: UserLevel }) {
  return (
    <div className="relative grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-[2rem] border border-white/80 bg-[radial-gradient(circle_at_50%_10%,rgba(236,253,245,0.95),rgba(255,255,255,0.82))] shadow-xl shadow-emerald-200">
      <img
        src={characterImages[level]}
        alt={stageNames[level]}
        className="h-full w-full object-contain p-1"
      />
    </div>
  );
}

function MissionChip({ done, label }: { done: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-black shadow-sm ${done ? "bg-emerald-900 text-white" : "bg-white/80 text-stone-400 ring-1 ring-stone-100"}`}>
      <span>{done ? "✓" : "○"}</span>
      <span>{label}</span>
    </span>
  );
}

export function LevelCard(props: LevelCardProps) {
  const { status, memberCode, handleName, hasActiveMood, spotlightActive, spotlightUsedToday } = props;
  const level = status.level as UserLevel;
  const spotlightUnlocked = status.spotlightUnlocked;
  const canUseSpotlight = spotlightUnlocked && hasActiveMood && !spotlightActive && !spotlightUsedToday;

  if (status.level >= 5 && spotlightUnlocked) {
    return (
      <section className="overflow-hidden rounded-[1.8rem] border border-emerald-100 bg-[radial-gradient(circle_at_0%_0%,rgba(6,95,70,0.18),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,255,255,0.70))] p-4 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img src="/noridrop-icon.png" alt="" className="h-14 w-14 rounded-2xl object-cover shadow-md" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-800">Spotlight Ready</p>
                <span className="rounded-full bg-stone-950 px-2.5 py-1 text-[10px] font-black text-white">Lv5</span>
              </div>
              <h2 className="mt-1 text-xl font-black text-stone-950">特別なノリを光らせる</h2>
              <p className="mt-1 text-xs leading-5 text-stone-600">NoriDropは完成。Spotlightだけをシンプルに使えます。</p>
            </div>
          </div>
          <form action={startSpotlight} className="shrink-0 sm:w-[190px]">
            <SubmitButton
              disabled={!canUseSpotlight}
              pendingText="発動中..."
              className="w-full rounded-2xl bg-gradient-to-r from-[#063f2e] via-[#0b6b47] to-[#12915f] px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-200 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {getLv5ButtonText(props)}
            </SubmitButton>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <CharacterImage level={level} />
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-800">NORI LIFE</p>
            <h2 className="mt-1 text-2xl font-black text-stone-950">Lv{level} {stageNames[level]}</h2>
            <p className="mt-1 text-sm leading-6 text-stone-600">{getNextUnlock(status) ?? "Spotlight解放まであと少し"}</p>
          </div>
        </div>
        <ShareInviteButton memberCode={memberCode} handleName={handleName} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <MissionChip done={getMissionDone(status, "avatar")} label="画像" />
        <MissionChip done={getMissionDone(status, "nori1")} label="1回" />
        <MissionChip done={getMissionDone(status, "nori2")} label="2回" />
        <MissionChip done={getMissionDone(status, "nori3")} label="3回" />
        {status.level >= 5 ? <MissionChip done={status.referralCount >= 1} label="招待1人" /> : null}
      </div>
    </section>
  );
}
