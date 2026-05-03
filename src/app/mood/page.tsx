import { redirect } from "next/navigation";
import { FormMessage } from "@/components/FormMessage";
import { startMoodSession } from "./actions";
import { createClient } from "@/lib/supabase/server";
import { MOODS } from "@/lib/moods";
import { formatRemainingTime, isMoodSessionActive, MOOD_SESSION_MINUTES } from "@/lib/session";
import type { MoodStatus, Profile } from "@/lib/types";

type MoodPageProps = { searchParams: Promise<{ message?: string }> };

export default async function MoodPage({ searchParams }: MoodPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (!profile || profile.deleted_at) redirect("/onboarding");

  const { data: currentMood } = await supabase
    .from("mood_statuses")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<MoodStatus>();

  if (isMoodSessionActive(currentMood)) redirect("/home");

  return (
    <main className="mx-auto grid min-h-screen max-w-4xl items-center px-6 py-10">
      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-2xl shadow-orange-100 backdrop-blur-xl">
        <p className="text-sm font-bold text-pink-700">Session Start</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">今の気分を選んでください</h1>
        <p className="mt-3 max-w-2xl leading-7 text-stone-700">
          選択後、{MOOD_SESSION_MINUTES}分間は変更できません。ホームには気分変更ボタンを置かず、更新頻度を抑えます。
        </p>
        {currentMood ? (
          <p className="mt-3 text-sm text-stone-500">前回のセッション: {formatRemainingTime(currentMood)}</p>
        ) : null}
        <div className="mt-5"><FormMessage message={params.message} /></div>

        <form action={startMoodSession} className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {MOODS.map((mood) => (
            <button key={mood.key} name="moodKey" value={mood.key} className="rounded-[1.6rem] border border-orange-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-pink-200 hover:shadow-md">
              <span className="block text-4xl">{mood.icon}</span>
              <span className="mt-3 block font-black">{mood.label}</span>
              <span className="mt-1 block text-xs text-stone-500">{mood.description}</span>
            </button>
          ))}
        </form>
      </section>
    </main>
  );
}
