import { ShareInviteButton } from "@/components/ShareInviteButton";
import { TransitionLink } from "@/components/TransitionLink";

const demoBubbles = [
  { icon: "🍚", name: "友達A", time: "12m", className: "left-[52%] top-[25%] h-28 w-28 border-red-200 bg-red-50 shadow-[0_0_38px_rgba(239,68,68,0.25)] ring-4 ring-red-100" },
  { icon: "💬", name: "友達B", time: "2h", className: "left-[30%] top-[58%] h-24 w-24 border-emerald-200 bg-emerald-50 shadow-[0_0_28px_rgba(16,185,129,0.22)] ring-4 ring-emerald-100" },
  { icon: "❤️", name: "友達C", time: "1d", className: "left-[72%] top-[66%] h-20 w-20 border-white bg-white/70 shadow-lg" }
];

export function FriendlessStarter({ inviteCode, ownerName }: { inviteCode?: string; ownerName?: string | null }) {
  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative min-h-[300px] overflow-hidden rounded-[1.8rem] border border-white/70 bg-[radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.95),transparent_32%),radial-gradient(circle_at_78%_26%,rgba(244,63,94,0.13),transparent_35%),radial-gradient(circle_at_45%_82%,rgba(16,185,129,0.13),transparent_43%)] p-4 shadow-inner">
        <div className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70" />
        <div className="absolute left-1/2 top-1/2 h-[45%] w-[45%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70" />
        <div className="absolute left-1/2 top-1/2 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/80 bg-white/80 text-center shadow-xl backdrop-blur-xl"><div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-pink-500">Preview</p><p className="mt-1 text-xs font-black text-stone-900">友達が増えると<br />こう見えます</p></div></div>
        {demoBubbles.map((bubble) => <div key={bubble.name} className={`absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border text-center backdrop-blur-xl ${bubble.className}`}><div><p className="text-2xl">{bubble.icon}</p><p className="mt-1 truncate px-2 text-[10px] font-black text-stone-900">{bubble.name}</p><p className="text-[9px] font-black text-stone-500">{bubble.time}</p></div></div>)}
      </div>
      <div className="space-y-3">
        <div className="rounded-[1.7rem] border border-emerald-100 bg-emerald-50/75 p-4"><p className="text-sm font-black text-emerald-900">まだ友達がいません</p><h3 className="mt-1 text-xl font-black">まず1人に共有しよう</h3><p className="mt-2 text-sm leading-6 text-stone-600">友達が増えると、使える気分と見え方が広がります。Lv5でSpotlightが解放されます。</p></div>
        {inviteCode ? <ShareInviteButton memberCode={inviteCode} handleName={ownerName} variant="card" /> : <TransitionLink href="/friends" className="block rounded-[1.7rem] bg-stone-950 px-5 py-4 text-center font-black text-white">友達ページへ</TransitionLink>}
      </div>
    </div>
  );
}
