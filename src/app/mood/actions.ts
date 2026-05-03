"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isMoodKey, type MoodKey } from "@/lib/moods";
import { isMoodSessionActive, MOOD_SESSION_MINUTES } from "@/lib/session";

export async function startMoodSession(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("id, is_adult, deleted_at").eq("id", user.id).maybeSingle<{ id: string; is_adult: boolean; deleted_at: string | null }>();
  if (!profile || profile.deleted_at) redirect("/onboarding");

  const { data: current } = await supabase.from("mood_statuses").select("session_expires_at").eq("user_id", user.id).maybeSingle<{ session_expires_at: string }>();
  if (isMoodSessionActive(current)) redirect(`/home?message=${encodeURIComponent("現在の気分セッション中は変更できません。")}`);

  const moodKey = String(formData.get("moodKey") ?? "") as MoodKey;
  if (!isMoodKey(moodKey)) redirect(`/mood?message=${encodeURIComponent("気分を選択してください。")}`);
  if (moodKey === "drink" && !profile.is_adult) redirect(`/mood?message=${encodeURIComponent("お酒アイコンを選ぶには、プロフィールで20歳以上にチェックしてください。")}`);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + MOOD_SESSION_MINUTES * 60 * 1000);
  const { error } = await supabase.from("mood_statuses").upsert({ user_id: user.id, mood_key: moodKey, last_login_at: now.toISOString(), session_started_at: now.toISOString(), session_expires_at: expiresAt.toISOString(), updated_at: now.toISOString() }, { onConflict: "user_id" });
  if (error) redirect(`/mood?message=${encodeURIComponent("気分の保存に失敗しました。")}`);
  redirect("/home");
}
