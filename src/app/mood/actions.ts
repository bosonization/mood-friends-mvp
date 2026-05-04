"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isMoodKey, type MoodKey } from "@/lib/moods";
import { getAndSyncLevelStatus, isMoodUnlocked } from "@/lib/level";
import { isMoodSessionActive, MOOD_SESSION_MINUTES } from "@/lib/session";

export async function startMoodSession(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_adult, deleted_at, max_level")
    .eq("id", user.id)
    .maybeSingle<{ id: string; is_adult: boolean; deleted_at: string | null; max_level: number | null }>();

  if (!profile || profile.deleted_at) redirect("/onboarding");

  const levelStatus = await getAndSyncLevelStatus(supabase, user.id, profile.max_level);

  const { data: current } = await supabase
    .from("mood_statuses")
    .select("session_expires_at")
    .eq("user_id", user.id)
    .maybeSingle<{ session_expires_at: string }>();

  if (isMoodSessionActive(current)) {
    redirect(`/home?message=${encodeURIComponent("今のノリはまだ変更できません。")}`);
  }

  const moodKey = String(formData.get("moodKey") ?? "") as MoodKey;
  if (!isMoodKey(moodKey)) {
    redirect(`/mood?message=${encodeURIComponent("今のノリを選択してください。")}`);
  }

  if (!isMoodUnlocked(moodKey, levelStatus.level)) {
    redirect(`/mood?message=${encodeURIComponent(`このノリはLv${levelStatus.level}ではまだ選べません。`)}`);
  }

  if (moodKey === "drink" && !profile.is_adult) {
    redirect(`/mood?message=${encodeURIComponent("飲みのノリは20歳以上で選べます。別のノリを選んでください。")}`);
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + MOOD_SESSION_MINUTES * 60 * 1000);

  const { data: entry, error: entryError } = await supabase
    .from("mood_entries")
    .insert({
      user_id: user.id,
      mood_key: moodKey,
      started_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      created_at: now.toISOString()
    })
    .select("id")
    .single<{ id: string }>();

  if (entryError || !entry) {
    redirect(`/mood?message=${encodeURIComponent("今のノリの保存に失敗しました。Supabase SQLが未実行の可能性があります。")}`);
  }

  const { error } = await supabase.from("mood_statuses").upsert(
    {
      user_id: user.id,
      mood_key: moodKey,
      last_login_at: now.toISOString(),
      session_started_at: now.toISOString(),
      session_expires_at: expiresAt.toISOString(),
      current_entry_id: entry.id,
      updated_at: now.toISOString()
    },
    { onConflict: "user_id" }
  );

  if (error) {
    redirect(`/mood?message=${encodeURIComponent("今のノリの保存に失敗しました。")}`);
  }

  redirect("/home");
}
