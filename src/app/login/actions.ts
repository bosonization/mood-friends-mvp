"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getSafeNext(formData: FormData) {
  const next = String(formData.get("next") ?? "/mood");
  return next.startsWith("/") && !next.startsWith("//") ? next : "/mood";
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

  if (password.length < 6) {
    redirect(`/login?message=${encodeURIComponent("パスワードは6文字以上で入力してください。")}`);
  }

  if (password !== passwordConfirm) {
    redirect(`/login?message=${encodeURIComponent("確認用パスワードが一致しません。もう一度入力してください。")}`);
  }

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/login?message=${encodeURIComponent("会員登録に失敗しました。別のメールアドレスを試してください。")}`);
  }

  redirect("/onboarding");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/");
}
