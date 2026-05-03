"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function withdraw() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("profiles").update({ deleted_at: new Date().toISOString(), handle_name: "退会済みユーザー", tagline: "", avatar_url: null }).eq("id", user.id);
  await supabase.auth.signOut();
  redirect("/");
}
