"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { normalizeMemberCode } from "@/lib/safety";

const messageMap: Record<string, string> = {
  requested: "友達申請を送りました。",
  pending: "すでに申請中です。",
  accepted: "すでに友達です。",
  rejected: "過去に拒否された申請があります。友達削除後に再申請してください。",
  self_request: "自分の会員コードには申請できません。",
  not_found: "会員コードが見つかりません。",
  invalid_code: "会員コードは10桁の数字で入力してください。",
  not_authenticated: "ログインしてください。"
};

export async function requestFriend(formData: FormData) {
  const supabase = await createClient();
  const memberCode = normalizeMemberCode(String(formData.get("memberCode") ?? ""));
  const { data, error } = await supabase.rpc("request_friend_by_code", { target_code: memberCode });
  if (error) redirect(`/friends?message=${encodeURIComponent("友達申請に失敗しました。")}`);
  redirect(`/friends?message=${encodeURIComponent(messageMap[String(data)] ?? "処理しました。")}`);
}

export async function acceptFriend(formData: FormData) {
  const supabase = await createClient();
  const friendshipId = String(formData.get("friendshipId") ?? "");
  await supabase.from("friendships").update({ status: "accepted" }).eq("id", friendshipId);
  redirect(`/friends?message=${encodeURIComponent("承認しました。")}`);
}

export async function rejectFriend(formData: FormData) {
  const supabase = await createClient();
  const friendshipId = String(formData.get("friendshipId") ?? "");
  await supabase.from("friendships").update({ status: "rejected" }).eq("id", friendshipId);
  redirect(`/friends?message=${encodeURIComponent("拒否しました。")}`);
}

export async function deleteFriend(formData: FormData) {
  const supabase = await createClient();
  const friendshipId = String(formData.get("friendshipId") ?? "");
  await supabase.from("friendships").delete().eq("id", friendshipId);
  redirect(`/friends?message=${encodeURIComponent("削除しました。")}`);
}
