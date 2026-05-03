"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { hasContactLikeText } from "@/lib/safety";

const schema = z.object({
  handleName: z.string().trim().min(1, "ハンドルネームを入力してください").max(30, "ハンドルネームは30文字以内です"),
  tagline: z.string().trim().max(15, "一言は15文字以内です").default(""),
  avatarUrl: z.string().trim().url("画像URLの形式が正しくありません").optional().or(z.literal("")),
  isAdult: z.boolean().default(false)
});

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = schema.safeParse({
    handleName: String(formData.get("handleName") ?? ""),
    tagline: String(formData.get("tagline") ?? ""),
    avatarUrl: String(formData.get("avatarUrl") ?? ""),
    isAdult: formData.get("isAdult") === "on"
  });

  if (!parsed.success) {
    redirect(`/profile?message=${encodeURIComponent(parsed.error.issues[0]?.message ?? "入力内容を確認してください。")}`);
  }

  const { handleName, tagline, avatarUrl, isAdult } = parsed.data;
  if (hasContactLikeText(handleName) || hasContactLikeText(tagline)) {
    redirect(`/profile?message=${encodeURIComponent("連絡先や外部IDのような文字列は入れられません。")}`);
  }

  const { error } = await supabase.from("profiles").update({ handle_name: handleName, tagline, avatar_url: avatarUrl || null, is_adult: isAdult }).eq("id", user.id);
  if (error) redirect(`/profile?message=${encodeURIComponent("更新に失敗しました。")}`);
  redirect(`/profile?message=${encodeURIComponent("更新しました。")}`);
}
