"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function cleanUuid(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function toggleMoodLike(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const moodEntryId = cleanUuid(formData.get("moodEntryId"));
  const targetUserId = cleanUuid(formData.get("targetUserId"));
  const intent = String(formData.get("intent") ?? "like");

  if (!moodEntryId || !targetUserId || targetUserId === user.id) {
    revalidatePath("/home");
    return;
  }

  if (intent === "unlike") {
    await supabase
      .from("mood_reactions")
      .delete()
      .eq("mood_entry_id", moodEntryId)
      .eq("actor_id", user.id)
      .eq("reaction_type", "like");
  } else {
    await supabase.from("mood_reactions").insert({
      mood_entry_id: moodEntryId,
      actor_id: user.id,
      target_user_id: targetUserId,
      reaction_type: "like"
    });
  }

  revalidatePath("/home");
}
