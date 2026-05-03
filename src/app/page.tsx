import { redirect } from "next/navigation";
import { TransitionLink } from "@/components/TransitionLink";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/mood");

  return (
    <main className="min-h-screen overflow-hidden px-6 py-7">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/70 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-3 font-black">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-orange-400 via-pink-500 to-violet-600 text-white shadow-md">e</span>
          <span>eMoodition</span>
        </div>
        <TransitionLink href="/login" className="rounded-full bg-stone-950 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-stone-800">ログイン</TransitionLink>
      </nav>

      <section className="mx-auto grid max-w-6xl items-center gap-10 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
        <div>
          <p className="mb-5 inline-flex rounded-full border border-orange-200 bg-white/70 px-4 py-2 text-sm font-bold text-orange-800 shadow-sm backdrop-blur">10分だけ、今の気分をそっと共有。</p>
          <h1 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight text-stone-950 sm:text-7xl">
            暇とは言えない日にも、
            <span className="block bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 bg-clip-text text-transparent">気分は置ける。</span>
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-8 text-stone-700 sm:text-lg">eMooditionは、友達だけに「今の気分」と「その時のログイン」を共有するアプリです。チャットもDMもなし。普段の会話が始まる、ほんの少し前のサインだけ。</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <TransitionLink href="/login" className="rounded-full bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 px-7 py-4 font-black text-white shadow-xl shadow-pink-200 transition hover:scale-[1.02]">はじめる</TransitionLink>
            <a href="#features" className="rounded-full border border-white bg-white/70 px-7 py-4 font-black text-stone-800 shadow-sm backdrop-blur hover:bg-white">機能を見る</a>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-8 -top-8 h-40 w-40 rounded-full bg-orange-300/30 blur-3xl" />
          <div className="absolute -bottom-8 -right-8 h-44 w-44 rounded-full bg-violet-400/25 blur-3xl" />
          <div className="relative rounded-[2.3rem] border border-white/70 bg-white/75 p-5 shadow-2xl shadow-orange-100 backdrop-blur-xl">
            <div className="rounded-[1.8rem] bg-stone-950 p-5 text-white shadow-xl">
              <div className="mb-5 flex items-center justify-between"><span className="text-sm text-stone-300">10分セッション</span><span className="rounded-full bg-white/10 px-3 py-1 text-xs">No Chat</span></div>
              <div className="grid grid-cols-2 gap-3">
                {[["🍚", "食事", "12分前"], ["🎮", "ゲーム", "28分前"], ["💬", "会話", "42分前"], ["❤️", "ウキウキ", "3時間前"]].map(([icon, mood, time]) => (
                  <div key={mood} className="rounded-3xl border border-white/10 bg-white/10 p-4"><p className="text-4xl">{icon}</p><p className="mt-3 font-black">{mood}</p><p className="mt-1 text-xs text-stone-400">{time}</p></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto grid max-w-6xl gap-4 pb-12 md:grid-cols-3">
        {[["10分で固定", "選んだ気分はセッション中変更不可。更新頻発を防ぎます。"], ["友達だけ", "会員コードと相互承認で、既につながっている人だけに表示。"], ["チャットなし", "アプリ内で連絡先やID交換をさせない設計です。"]].map(([title, body]) => (
          <div key={title} className="rounded-[1.7rem] border border-white/70 bg-white/70 p-6 shadow-sm backdrop-blur"><h2 className="text-lg font-black">{title}</h2><p className="mt-2 text-sm leading-6 text-stone-600">{body}</p></div>
        ))}
      </section>
    </main>
  );
}
