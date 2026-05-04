"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getSafeNext(formData: FormData) {
  const next = String(formData.get("next") ?? "/mood");
  return next.startsWith("/") && !next.startsWith("//") ? next : "/mood";
}

function getInviteToken(formData: FormData) {
  return String(formData.get("inviteToken") ?? "").replace(/[^0-9a-f]/gi, "").toLowerCase().slice(0, 32);
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = getSafeNext(formData);

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/login?message=${encodeURIComponent("ログインに失敗しました。メールアドレスとパスワードを確認してください。")}`);
  }

  redirect(next === "/home" ? "/mood" : next);
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");
  const inviteToken = getInviteToken(formData);
  const inviteQuery = inviteToken.length === 32 ? `invite=${inviteToken}&` : "";

  if (password.length < 6) {
    redirect(`/login?${inviteQuery}message=${encodeURIComponent("パスワードは6文字以上で入力してください。")}`);
  }

  if (password !== passwordConfirm) {
    redirect(`/login?${inviteQuery}message=${encodeURIComponent("パスワードと確認用パスワードが一致しません。")}`);
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: inviteToken.length === 32 ? { invite_token: inviteToken } : undefined
    }
  });

  if (error) {
    redirect(`/login?${inviteQuery}message=${encodeURIComponent("会員登録に失敗しました。別のメールアドレスを試してください。")}`);
  }

  redirect(inviteToken.length === 32 ? `/onboarding?invite=${inviteToken}` : "/onboarding");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
