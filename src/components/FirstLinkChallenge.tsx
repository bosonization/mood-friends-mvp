import { ShareInviteButton } from "@/components/ShareInviteButton";

type FirstLinkChallengeProps = {
  friendCount: number;
  memberCode: string;
  handleName: string;
};

export function FirstLinkChallenge({ friendCount, memberCode, handleName }: FirstLinkChallengeProps) {
  if (friendCount > 0) return null;

  return (
    <section className="rounded-[2rem] border border-cyan-100 bg-cyan-50/80 p-5 shadow-sm backdrop-blur-xl">
      <p className="text-sm font-black text-cyan-800">First Link Challenge</p>
      <h2 className="mt-1 text-2xl font-black">最初の24時間で、友達1人とつながろう</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
        友達が1人できると、ノリを見る体験が一気に始まります。24時間招待リンクやQRで、まず1人と一緒に始めましょう。
      </p>
      <div className="mt-4">
        <ShareInviteButton memberCode={memberCode} handleName={handleName} />
      </div>
    </section>
  );
}
