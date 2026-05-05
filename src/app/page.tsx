import { redirect } from "next/navigation";
import { AppFooter } from "@/components/AppFooter";
import { TransitionLink } from "@/components/TransitionLink";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/mood");

  return (
    <main className="min-h-screen overflow-hidden px-6 py-7">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/70 bg-white/78 px-4 py-3 shadow-sm backdrop-blur-xl">
        <div className="flex min-w-0 items-center gap-3 font-black">
          <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-emerald-100">
            <img src="/noridrop-icon.png" alt="" className="h-full w-full object-cover" />
          </span>
          <img src="/noridrop-logo.png" alt="NoriDrop" className="h-8 w-auto max-w-[170px] object-contain" />
        </div>
        <TransitionLink href="/login" className="rounded-full bg-stone-950 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-stone-800">ログイン</TransitionLink>
      </nav>

      <section className="mx-auto grid max-w-6xl items-center gap-10 py-12 lg:grid-cols-[0.98fr_1.02fr] lg:py-16">
        <div>
          <p className="mb-5 inline-flex rounded-full border border-emerald-200 bg-white/70 px-4 py-2 text-sm font-bold text-emerald-900 shadow-sm backdrop-blur">友達にだけ、今のノリをそっとDrop。</p>
          <h1 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight text-stone-950 sm:text-7xl">
            友達の
            <span className="block bg-gradient-to-r from-[#063f2e] via-[#0b6b47] to-[#12915f] bg-clip-text text-transparent">「今どんなノリ？」</span>
            がわかるアプリ
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-8 text-stone-700 sm:text-lg">
            暇とは言いにくい。でも、今なら乗れるノリはある。NoriDropは、友達だけに「今なら乗れそうなこと」をそっと置けるアプリです。チャットやDMはなく、声をかけるきっかけだけをつくります。
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <TransitionLink href="/login" className="rounded-full bg-gradient-to-r from-[#063f2e] via-[#0b6b47] to-[#12915f] px-7 py-4 font-black text-white shadow-xl shadow-emerald-200 transition hover:scale-[1.02]">はじめる</TransitionLink>
            <a href="#nori" className="rounded-full border border-white bg-white/70 px-7 py-4 font-black text-stone-800 shadow-sm backdrop-blur hover:bg-white">ノリを見る</a>
          </div>
        </div>

        <div className="relative" id="nori">
          <div className="absolute -left-8 -top-8 h-40 w-40 rounded-full bg-emerald-300/25 blur-3xl" />
          <div className="absolute -bottom-8 -right-8 h-44 w-44 rounded-full bg-[#ff6b5f]/16 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2.3rem] border border-white/70 bg-white/78 p-4 shadow-2xl shadow-emerald-200 backdrop-blur-xl">
            <img
              src="/nori-hero.png"
              alt="友達の今どんなノリ？がわかるNoriDropの紹介画像"
              className="h-auto w-full rounded-[1.8rem] object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 pb-8 md:grid-cols-3">
        {[
          ["ノリをDrop", "今なにしてる？ではなく、今どんな誘いなら乗れそう？を置いておけます。"],
          ["友達だけ", "会員コード・招待リンク・相互承認で、既につながっている人だけに表示します。"],
          ["チャットなし", "アプリ内DMやID交換はなし。声をかけるきっかけだけをつくります。"]
        ].map(([title, body]) => (
          <div key={title} className="rounded-[1.7rem] border border-white/70 bg-white/70 p-6 shadow-sm backdrop-blur">
            <h2 className="text-lg font-black">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">{body}</p>
          </div>
        ))}
      </section>

      <div className="mx-auto max-w-6xl"><AppFooter /></div>
    </main>
  );
}
