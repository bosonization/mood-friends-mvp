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

function normalizeToken(value: string) {
  return value.replace(/[^0-9a-f]/gi, "").toLowerCase().slice(0, 32);
}

async function acceptInviteIfValid(supabase: Awaited<ReturnType<typeof createClient>>, inviteTokenRaw: string) {
  const inviteToken = normalizeToken(inviteTokenRaw);
  if (inviteToken.length !== 32) return;

  await supabase.rpc("accept_invite_link", { invite_token: inviteToken });
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

  await supabase.from("terms_consents").insert({ user_id: user.id, terms_version: "2026-05-05" });

  const inviteFromForm = String(formData.get("inviteToken") ?? "");
  const inviteFromMetadata = typeof user.user_metadata?.invite_token === "string" ? user.user_metadata.invite_token : "";
  await acceptInviteIfValid(supabase, inviteFromForm || inviteFromMetadata);

  redirect("/mood");
}
