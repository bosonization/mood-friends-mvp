import { ShareInviteButton } from "@/components/ShareInviteButton";

type FirstLinkChallengeProps = {
  friendCount: number;
  memberCode: string;
  handleName: string;
};

export function FirstLinkChallenge({ friendCount, memberCode, handleName }: FirstLinkChallengeProps) {
  if (friendCount > 0) return null;

  return (
    <section className="overflow-hidden rounded-[1.7rem] border border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(88,28,135,0.88),rgba(236,72,153,0.72))] p-4 text-white shadow-xl shadow-fuchsia-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-fuchsia-200">Unlock Spotlight</p>
          <h2 className="mt-1 text-xl font-black">友達を招待して、特別な機能を解放</h2>
          <p className="mt-1 text-sm leading-6 text-white/72">
            Lv5になったら、招待リンク経由で1人登録されるとSpotlightが使えるようになります。
          </p>
        </div>
        <div className="shrink-0 rounded-2xl bg-white/12 p-1 backdrop-blur">
          <ShareInviteButton memberCode={memberCode} handleName={handleName} />
        </div>
      </div>
    </section>
  );
}
