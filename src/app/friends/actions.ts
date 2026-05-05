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


export async function saveFriendMemo(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/friends?message=${encodeURIComponent("ログインしてください。")}`);

  const friendId = String(formData.get("friendId") ?? "");
  const note = String(formData.get("note") ?? "").trim().slice(0, 80);

  if (!friendId) {
    redirect(`/friends?message=${encodeURIComponent("メモの保存に失敗しました。")}`);
  }

  if (!note) {
    await supabase.from("friend_memos").delete().eq("owner_id", user.id).eq("friend_id", friendId);
    redirect(`/friends?message=${encodeURIComponent("自分メモを削除しました。")}`);
  }

  const { error } = await supabase.from("friend_memos").upsert(
    {
      owner_id: user.id,
      friend_id: friendId,
      note,
      updated_at: new Date().toISOString()
    },
    { onConflict: "owner_id,friend_id" }
  );

  if (error) {
    redirect(`/friends?message=${encodeURIComponent("自分メモの保存に失敗しました。")}`);
  }

  redirect(`/friends?message=${encodeURIComponent("自分メモを保存しました。")}`);
}
