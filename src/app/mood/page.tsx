import { redirect } from "next/navigation";
import { FormMessage } from "@/components/FormMessage";
import { MoodSelectionForm } from "@/components/MoodSelectionForm";
import { createClient } from "@/lib/supabase/server";
import { getMood } from "@/lib/moods";
import { getAndSyncLevelStatus } from "@/lib/level";
import { formatRemainingTime, isMoodSessionActive, MOOD_SESSION_MINUTES } from "@/lib/session";
import type { MoodStatus, Profile } from "@/lib/types";

type MoodPageProps = { searchParams: Promise<{ message?: string }> };

export default async function MoodPage({ searchParams }: MoodPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>();
  if (!profile || profile.deleted_at) redirect("/onboarding");

  const levelStatus = await getAndSyncLevelStatus(supabase, user.id, profile.max_level);

  const { data: currentMood } = await supabase.from("mood_statuses").select("*").eq("user_id", user.id).maybeSingle<MoodStatus>();
  if (isMoodSessionActive(currentMood)) redirect("/home");
  const previousMood = getMood(currentMood?.mood_key);

  return (
    <main className="mx-auto grid min-h-screen max-w-4xl items-center px-6 py-10">
      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-2xl shadow-orange-100 backdrop-blur-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-pink-700">Session Start</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">今の気分を選んでください</h1>
          </div>
          <div className="rounded-2xl bg-stone-950 px-4 py-3 text-right text-white">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-stone-400">Level</p>
            <p className="text-lg font-black">Lv{levelStatus.level}</p>
          </div>
        </div>
        <p className="mt-3 max-w-2xl leading-7 text-stone-700">
          選択後、{MOOD_SESSION_MINUTES}分間は変更できません。レベルが上がると選べる気分が増えます。
        </p>
        {currentMood && previousMood ? (
          <div className="mt-5 rounded-[1.7rem] border border-cyan-100 bg-cyan-50/70 p-4">
            <p className="text-sm font-bold text-cyan-900">前回登録した気分</p>
            <div className="mt-2 flex items-center gap-3"><span className="text-4xl">{previousMood.icon}</span><div><p className="font-black">{previousMood.label}</p><p className="text-xs text-cyan-800">前回セッション: {formatRemainingTime(currentMood)}</p></div></div>
          </div>
        ) : null}
        <div className="mt-5"><FormMessage message={params.message} /></div>
        <MoodSelectionForm previousMoodKey={currentMood?.mood_key} level={levelStatus.level} />
      </section>
    </main>
  );
}
