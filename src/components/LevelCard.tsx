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

const growthSteps: Array<{ level: UserLevel; title: string; unlock: string }> = [
  { level: 1, title: "Lv1", unlock: "4気分" },
  { level: 2, title: "Lv2", unlock: "+散歩" },
  { level: 3, title: "Lv3", unlock: "+作業" },
  { level: 4, title: "Lv4", unlock: "全気分" }
];

function getNextText(status: LevelStatus) {
  if (status.level <= 1) return "友達を1人追加すると、散歩が解放されます。";
  if (status.level <= 2) return "友達を2人にすると、作業が解放されます。";
  if (status.level <= 3) return "友達を3人にすると、お酒・ウキウキを含む全気分が解放されます。";
  return "全気分は解放済み。招待コード経由で1人登録されると、Spotlightが解放されます。";
}

function getLv5ButtonText({ status, hasActiveMood, spotlightActive, spotlightUsedToday }: LevelCardProps) {
  if (status.level < 5) return "Lv5で解放";
  if (!hasActiveMood) return "気分登録後に使用";
  if (spotlightActive) return "Spotlight中";
  if (spotlightUsedToday) return "今日は使用済み";
  return "Spotlightを使う";
}

export function LevelCard(props: LevelCardProps) {
  const { status, memberCode, handleName, hasActiveMood, spotlightActive, spotlightUsedToday } = props;
  const canUseSpotlight = status.level >= 5 && hasActiveMood && !spotlightActive && !spotlightUsedToday;

  if (status.level >= 5) {
    return (
      <section className="rounded-[2rem] border border-fuchsia-100 bg-[radial-gradient(circle_at_20%_0%,rgba(217,70,239,0.18),transparent_34%),rgba(255,255,255,0.86)] p-5 shadow-sm backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black text-fuchsia-700">Lv5 Spotlight</p>
            <h2 className="mt-1 text-2xl font-black">今日のノリを30分だけ強調</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">友達のMood Orbit上で、あなたのバブルが特別表示されます。通知やDMは送りません。</p>
          </div>
          <form action={startSpotlight}>
            <SubmitButton
              disabled={!canUseSpotlight}
              pendingText="発動中..."
              className="rounded-2xl bg-gradient-to-r from-fuchsia-500 to-violet-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-fuchsia-100 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {getLv5ButtonText(props)}
            </SubmitButton>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black text-pink-700">Growth</p>
          <h2 className="mt-1 text-2xl font-black">Lv{status.level} {status.label}</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-stone-600">{getNextText(status)}</p>
        </div>
        <ShareInviteButton memberCode={memberCode} handleName={handleName} />
      </div>

      <div className="mt-5 grid grid-cols-4 gap-2">
        {growthSteps.map((step) => {
          const reached = status.level >= step.level;
          const current = status.level === step.level;
          return (
            <div
              key={step.level}
              className={`rounded-[1.25rem] border p-3 text-center transition ${
                reached
                  ? current
                    ? "border-pink-200 bg-pink-50 ring-4 ring-pink-100"
                    : "border-emerald-200 bg-emerald-50"
                  : "border-stone-100 bg-stone-50/80 opacity-65"
              }`}
            >
              <p className={`text-sm font-black ${reached ? "text-stone-900" : "text-stone-400"}`}>{step.title}</p>
              <p className={`mt-1 text-[11px] font-bold ${reached ? "text-stone-600" : "text-stone-400"}`}>{step.unlock}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-[1.25rem] border border-orange-100 bg-orange-50/75 p-4 text-sm leading-6 text-stone-700">
        <p className="font-black text-orange-900">次の解放</p>
        <p className="mt-1">{getNextText(status)}</p>
        <p className="mt-2 text-xs text-stone-500">現在：友達 {status.friendCount}/3、招待登録 {status.referralCount}/1</p>
      </div>
    </section>
  );
}
