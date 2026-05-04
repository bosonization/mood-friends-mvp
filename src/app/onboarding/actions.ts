"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { hasContactLikeText, normalizeMemberCode } from "@/lib/safety";

const schema = z.object({
  handleName: z.string().trim().min(1, "ハンドルネームを入力してください").max(30, "ハンドルネームは30文字以内です"),
  tagline: z.string().trim().max(15, "一言は15文字以内です").default(""),
  avatarUrl: z.string().trim().url("画像URLの形式が正しくありません").optional().or(z.literal("")),
  isAdult: z.boolean().default(false)
});

async function registerReferral(supabase: Awaited<ReturnType<typeof createClient>>, inviteCodeRaw: string) {
  const inviteCode = normalizeMemberCode(inviteCodeRaw);
  if (inviteCode.length !== 10) return;

  await supabase.rpc("record_referral_by_code", { target_code: inviteCode });
}


export async function createProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (formData.get("terms") !== "on") {
    redirect(`/onboarding?message=${encodeURIComponent("利用規約への同意が必要です")}`);
  }

  const parsed = schema.safeParse({
    handleName: String(formData.get("handleName") ?? ""),
    tagline: String(formData.get("tagline") ?? ""),
    avatarUrl: String(formData.get("avatarUrl") ?? ""),
    isAdult: formData.get("isAdult") === "on"
  });

  if (!parsed.success) {
    redirect(`/onboarding?message=${encodeURIComponent(parsed.error.issues[0]?.message ?? "入力内容を確認してください")}`);
  }

  const { handleName, tagline, avatarUrl, isAdult } = parsed.data;
  if (hasContactLikeText(handleName) || hasContactLikeText(tagline)) {
    redirect(`/onboarding?message=${encodeURIComponent("連絡先や外部IDのような文字列は入れられません。")}`);
  }

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    handle_name: handleName,
    tagline,
    avatar_url: avatarUrl || null,
    is_adult: isAdult,
    terms_agreed_at: new Date().toISOString(),
    deleted_at: null,
    max_level: 1
  });

  if (error) {
    redirect(`/onboarding?message=${encodeURIComponent("プロフィール作成に失敗しました。Supabase SQLが未実行の可能性があります。")}`);
  }

  await supabase.from("terms_consents").insert({ user_id: user.id, terms_version: "2026-05-04" });

  const inviteFromForm = String(formData.get("inviteCode") ?? "");
  const inviteFromMetadata = typeof user.user_metadata?.invite_code === "string" ? user.user_metadata.invite_code : "";
  await registerReferral(supabase, inviteFromForm || inviteFromMetadata);

  redirect("/mood");
}
