"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CURRENT_TUTORIAL_VERSION } from "@/lib/tutorial";

export async function completeTutorial() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("profiles")
    .update({
      tutorial_version: CURRENT_TUTORIAL_VERSION,
      tutorial_seen_at: new Date().toISOString()
    })
    .eq("id", user.id);

  revalidatePath("/home");
}
