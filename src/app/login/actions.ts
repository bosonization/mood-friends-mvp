"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { normalizeMemberCode } from "@/lib/safety";

function getSafeNext(formData: FormData) {
  const next = String(formData.get("next") ?? "/mood");
  return next.startsWith("/") && !next.startsWith("//") ? next : "/mood";
}

function getInviteCode(formData: FormData) {
  const invite = normalizeMemberCode(String(formData.get("inviteCode") ?? ""));
  return invite.length === 10 ? invite : "";
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
  const inviteCode = getInviteCode(formData);

  if (password.length < 6) {
    redirect(`/login?invite=${inviteCode}&message=${encodeURIComponent("パスワードは6文字以上で入力してください。")}`);
  }

  if (password !== passwordConfirm) {
    redirect(`/login?invite=${inviteCode}&message=${encodeURIComponent("パスワードと確認用パスワードが一致しません。")}`);
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: inviteCode ? { invite_code: inviteCode } : undefined
    }
  });

  if (error) {
    redirect(`/login?invite=${inviteCode}&message=${encodeURIComponent("会員登録に失敗しました。別のメールアドレスを試してください。")}`);
  }

  redirect(inviteCode ? `/onboarding?invite=${inviteCode}` : "/onboarding");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
