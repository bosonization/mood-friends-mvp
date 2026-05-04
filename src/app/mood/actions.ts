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
    .select("id, is_adult, deleted_at, max_level, nori_update_count")
    .eq("id", user.id)
    .maybeSingle<{ id: string; is_adult: boolean; deleted_at: string | null; max_level: number | null; nori_update_count: number | null }>();

  if (!profile || profile.deleted_at) redirect("/onboarding");

  const levelStatus = await getAndSyncLevelStatus(supabase, user.id, profile.max_level);

  const { data: current } = await supabase
    .from("mood_statuses")
    .select("mood_key, session_expires_at, current_entry_id")
    .eq("user_id", user.id)
    .maybeSingle<{ mood_key: string; session_expires_at: string; current_entry_id?: string | null }>();

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

  // Quiet pass: チルを5回タップして更新した場合、1日1回だけノリと最終ログインを更新せずホームへ入る。
  // これは「ノリ更新」ではないため、mood_entries作成・nori_update_count加算もしない。
  const stealthMode = String(formData.get("stealthMode") ?? "") === "on";
  if (stealthMode && moodKey === "cafe" && current?.current_entry_id) {
    const today = new Date().toISOString().slice(0, 10);
    const { data: usedToday } = await supabase
      .from("nori_stealth_uses")
      .select("id")
      .eq("user_id", user.id)
      .eq("use_date", today)
      .maybeSingle<{ id: string }>();

    if (usedToday) {
      redirect(`/mood?message=${encodeURIComponent("Quiet passは今日は使用済みです。")}`);
    }

    const { error: stealthError } = await supabase.from("nori_stealth_uses").insert({
      user_id: user.id,
      use_date: today
    });

    if (!stealthError) {
      redirect(`/home?message=${encodeURIComponent("ノリを更新せずに入りました。")}`);
    }
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + MOOD_SESSION_MINUTES * 60 * 1000);

  // いいねは「ノリ履歴」に紐づくため、現在のノリとは別に mood_entries を必ず作る。
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

  // レベル成長用のノリ更新回数。Quiet passでは加算しない。
  const nextUpdateCount = Math.min((profile.nori_update_count ?? 0) + 1, 9999);
  await supabase.from("profiles").update({ nori_update_count: nextUpdateCount }).eq("id", user.id);
  const nextStatus = await getAndSyncLevelStatus(supabase, user.id, profile.max_level);

  if (nextStatus.level > levelStatus.level) {
    redirect(`/home?message=${encodeURIComponent(`NORI LIFEが育ちました。Lv${nextStatus.level} ${nextStatus.label}！`)}`);
  }

  redirect("/home");
}
