"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { normalizeViewMode } from "@/lib/viewMode";

export async function updateDisplayMode(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const displayMode = normalizeViewMode(String(formData.get("displayMode") ?? "orbit"));

  const { error } = await supabase
    .from("profiles")
    .update({ display_mode: displayMode })
    .eq("id", user.id);

  if (error) {
    redirect(`/settings?message=${encodeURIComponent("表示形式の保存に失敗しました。先にSupabase SQLを実行してください。")}`);
  }

  redirect(`/settings?message=${encodeURIComponent("表示形式を保存しました。")}`);
}

export async function withdraw() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("profiles").update({ deleted_at: new Date().toISOString(), handle_name: "退会済みユーザー", tagline: "", avatar_url: null }).eq("id", user.id);
  await supabase.auth.signOut();
  redirect("/");
}
