import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/home");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10">
      <section className="grid flex-1 items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-sm font-medium">
            チャットなし。友達だけの気分共有。
          </p>
          <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            「暇？」を言う前の、
            <br />
            ちょうどいい一押し。
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-stone-700">
            Mood Friendsは、既につながっている友達にだけ「今の気分」と「ラストログイン」を共有するMVPです。
            DMもチャットもありません。会話のきっかけだけを、そっと置きます。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-full bg-stone-950 px-6 py-3 font-bold text-white shadow-lg shadow-stone-300 hover:bg-stone-800"
            >
              はじめる
            </Link>
            <a
              href="#features"
              className="rounded-full border border-orange-200 bg-white/70 px-6 py-3 font-bold hover:bg-white"
            >
              機能を見る
            </a>
          </div>
        </div>

        <div className="rounded-[2rem] border border-orange-100 bg-white/75 p-5 shadow-xl shadow-orange-100 backdrop-blur">
          <div className="rounded-[1.5rem] bg-stone-950 p-4 text-white">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-stone-300">友達の今</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs">チャットなし</span>
            </div>

            <div className="space-y-3">
              {[
                ["🍚", "佐藤", "食事", "12分前"],
                ["🎮", "yuki", "ゲーム", "28分前"],
                ["☕", "mori", "カフェ", "1時間前"]
              ].map(([icon, name, mood, time]) => (
                <div key={name} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-xl">
                    {icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{name}</p>
                    <p className="text-sm text-stone-300">{mood}</p>
                  </div>
                  <p className="text-xs text-stone-400">{time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="grid gap-4 pb-10 md:grid-cols-3">
        {[
          ["10桁コード", "会員コードで友達申請。公開検索はありません。"],
          ["相互承認", "承認済みの友達だけが一覧に表示されます。"],
          ["気分8種", "食事、お酒、旅行、ゲームなどをワンタップ共有。"]
        ].map(([title, body]) => (
          <div key={title} className="rounded-3xl border border-orange-100 bg-white/70 p-5">
            <h2 className="font-bold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">{body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
