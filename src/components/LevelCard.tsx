import { ShareInviteButton } from "@/components/ShareInviteButton";
import { SubmitButton } from "@/components/SubmitButton";
import { startSpotlight } from "@/app/home/actions";
import type { LevelStatus } from "@/lib/level";

type LevelCardProps = {
  status: LevelStatus;
  memberCode: string;
  handleName: string;
  hasActiveMood: boolean;
  spotlightActive: boolean;
  spotlightUsedToday: boolean;
};

function getProgressPercent(status: LevelStatus) {
  if (status.level >= 5) return 100;
  if (status.level === 4) return status.needsReferralForLv5 ? 84 : 78;
  if (status.level === 3) return 62;
  if (status.level === 2) return 42;
  return 18;
}

export function LevelCard({ status, memberCode, handleName, hasActiveMood, spotlightActive, spotlightUsedToday }: LevelCardProps) {
  const canUseSpotlight = status.level >= 5 && hasActiveMood && !spotlightActive && !spotlightUsedToday;
  const disabledReason = status.level < 5
    ? "Lv5で解放"
    : !hasActiveMood
      ? "気分セッション開始後に使用できます"
      : spotlightActive
        ? "Spotlight中"
        : spotlightUsedToday
          ? "今日は使用済み"
          : "";

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black text-pink-700">Growth</p>
          <h2 className="mt-1 text-2xl font-black">Lv{status.level} {status.label}</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-stone-600">{status.nextMessage}</p>
        </div>
        <div className="rounded-[1.4rem] bg-stone-950 px-4 py-3 text-right text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-stone-400">Progress</p>
          <p className="text-lg font-black">{status.friendCount}/3 友達</p>
          <p className="text-xs text-stone-400">招待登録 {status.referralCount}/1</p>
        </div>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-stone-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-400 via-pink-500 to-violet-600 transition-all"
          style={{ width: `${getProgressPercent(status)}%` }}
        />
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_0.95fr]">
        <div className="rounded-[1.45rem] border border-orange-100 bg-orange-50/70 p-4">
          <p className="text-sm font-black text-orange-900">次の解放</p>
          {status.level < 4 ? (
            <p className="mt-2 text-sm leading-6 text-stone-700">友達を増やすと、選べる気分が増えます。Lv4で「お酒」「ウキウキ」を含む全8気分が解放されます。</p>
          ) : status.level < 5 ? (
            <p className="mt-2 text-sm leading-6 text-stone-700">全気分は解放済みです。招待コード経由で1人登録されると、Lv5 Spotlightが解放されます。</p>
          ) : (
            <p className="mt-2 text-sm leading-6 text-stone-700">1日1回、30分間だけ自分のバブルを友達のOrbitで特別表示できます。</p>
          )}
          <div className="mt-3">
            <ShareInviteButton memberCode={memberCode} handleName={handleName} />
          </div>
        </div>

        <div className="rounded-[1.45rem] border border-fuchsia-100 bg-fuchsia-50/70 p-4">
          <p className="text-sm font-black text-fuchsia-900">Lv5 Spotlight</p>
          <p className="mt-2 text-sm leading-6 text-stone-700">友達のMood Orbit上で、あなたの気分を30分間だけ強調します。通知やDMは送りません。</p>
          <form action={startSpotlight} className="mt-3">
            <SubmitButton
              disabled={!canUseSpotlight}
              pendingText="発動中..."
              className="w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 to-violet-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-fuchsia-100 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {canUseSpotlight ? "Spotlightを使う" : disabledReason}
            </SubmitButton>
          </form>
        </div>
      </div>
    </section>
  );
}
