"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MOODS, type MoodKey } from "@/lib/moods";

export async function updateMood(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const moodKey = String(formData.get("moodKey") ?? "") as MoodKey;
  const isValid = MOODS.some((mood) => mood.key === moodKey);

  if (!isValid) {
    redirect("/home?message=invalid_mood");
  }

  if (moodKey === "drink") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_adult")
      .eq("id", user.id)
      .maybeSingle<{ is_adult: boolean }>();

    if (!profile?.is_adult) {
      redirect("/home?message=adult_required");
    }
  }

  const now = new Date().toISOString();

  const { error } = await supabase.from("mood_statuses").upsert(
    {
      user_id: user.id,
      mood_key: moodKey,
      last_login_at: now,
      updated_at: now
    },
    { onConflict: "user_id" }
  );

  if (error) {
    redirect("/home?message=failed");
  }

  redirect("/home");
}
