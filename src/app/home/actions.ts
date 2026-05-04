"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAndSyncLevelStatus } from "@/lib/level";
import { isMoodSessionActive } from "@/lib/session";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function startSpotlight() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, max_level, deleted_at")
    .eq("id", user.id)
    .maybeSingle<{ id: string; max_level: number | null; deleted_at: string | null }>();

  if (!profile || profile.deleted_at) redirect("/onboarding");

  const levelStatus = await getAndSyncLevelStatus(supabase, user.id, profile.max_level);
  if (levelStatus.level < 5) {
    redirect(`/home?message=${encodeURIComponent("SpotlightはLv5で解放されます。")}`);
  }

  const { data: mood } = await supabase
    .from("mood_statuses")
    .select("session_expires_at")
    .eq("user_id", user.id)
    .maybeSingle<{ session_expires_at: string }>();

  if (!isMoodSessionActive(mood)) {
    redirect(`/mood?message=${encodeURIComponent("Spotlightは気分セッション中のみ使えます。")}`);
  }

  const spotlightDate = todayKey();
  const { data: usedToday } = await supabase
    .from("mood_spotlights")
    .select("id")
    .eq("user_id", user.id)
    .eq("spotlight_date", spotlightDate)
    .maybeSingle<{ id: string }>();

  if (usedToday) {
    redirect(`/home?message=${encodeURIComponent("今日のSpotlightは使用済みです。")}`);
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);

  const { error } = await supabase.from("mood_spotlights").insert({
    user_id: user.id,
    spotlight_date: spotlightDate,
    started_at: now.toISOString(),
    expires_at: expiresAt.toISOString()
  });

  if (error) {
    redirect(`/home?message=${encodeURIComponent("Spotlightの発動に失敗しました。今日すでに使用済みの可能性があります。")}`);
  }

  redirect(`/home?message=${encodeURIComponent("Spotlightを30分間発動しました。")}`);
}
