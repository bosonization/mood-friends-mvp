"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { hasContactLikeText } from "@/lib/safety";
import { getAndSyncLevelStatus } from "@/lib/level";

const schema = z.object({
  handleName: z.string().trim().min(1, "ハンドルネームを入力してください").max(30, "ハンドルネームは30文字以内です"),
  tagline: z.string().trim().max(15, "一言は15文字以内です").default(""),
  avatarUrl: z.string().trim().url("画像URLの形式が正しくありません").optional().or(z.literal("")),
  isAdult: z.boolean().default(false)
});

function parseIsAdult(formData: FormData) {
  const ageGroup = String(formData.get("ageGroup") ?? "");
  if (ageGroup === "adult20") return true;
  if (ageGroup === "under20") return false;
  return formData.get("isAdult") === "on";
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = schema.safeParse({
    handleName: String(formData.get("handleName") ?? ""),
    tagline: String(formData.get("tagline") ?? ""),
    avatarUrl: String(formData.get("avatarUrl") ?? ""),
    isAdult: parseIsAdult(formData)
  });

  if (!parsed.success) {
    redirect(`/profile?message=${encodeURIComponent(parsed.error.issues[0]?.message ?? "入力内容を確認してください。")}`);
  }

  const { handleName, tagline, avatarUrl, isAdult } = parsed.data;
  if (hasContactLikeText(handleName) || hasContactLikeText(tagline)) {
    redirect(`/profile?message=${encodeURIComponent("連絡先や外部IDのような文字列は入れられません。")}`);
  }

  const { data: beforeProfile } = await supabase.from("profiles").select("max_level").eq("id", user.id).maybeSingle<{ max_level: number | null }>();
  const beforeStatus = await getAndSyncLevelStatus(supabase, user.id, beforeProfile?.max_level);

  const { error } = await supabase.from("profiles").update({ handle_name: handleName, tagline, avatar_url: avatarUrl || null, is_adult: isAdult }).eq("id", user.id);
  if (error) redirect(`/profile?message=${encodeURIComponent("更新に失敗しました。")}`);

  const afterStatus = await getAndSyncLevelStatus(supabase, user.id, beforeProfile?.max_level);
  if (afterStatus.level > beforeStatus.level) {
    redirect(`/profile?message=${encodeURIComponent(`ノリのたねが育ちました。Lv${afterStatus.level} ${afterStatus.label}！`)}`);
  }

  redirect(`/profile?message=${encodeURIComponent("更新しました。")}`);
}
