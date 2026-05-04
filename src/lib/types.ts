import type { ViewMode } from "@/lib/viewMode";

export type Profile = {
  id: string;
  member_code: string;
  handle_name: string;
  tagline: string;
  avatar_url: string | null;
  is_adult: boolean;
  display_mode?: ViewMode | null;
  max_level?: number | null;
  terms_agreed_at: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type Friendship = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  updated_at: string;
};

export type MoodStatus = {
  user_id: string;
  mood_key: string;
  last_login_at: string;
  session_started_at: string;
  session_expires_at: string;
  current_entry_id?: string | null;
  created_at: string;
  updated_at: string;
};

export type MoodEntry = {
  id: string;
  user_id: string;
  mood_key: string;
  started_at: string;
  expires_at: string;
  created_at: string;
};

export type MoodReaction = {
  id: string;
  mood_entry_id: string;
  actor_id: string;
  target_user_id: string;
  reaction_type: "like";
  created_at: string;
};

export type MoodSpotlight = {
  id: string;
  user_id: string;
  spotlight_date: string;
  started_at: string;
  expires_at: string;
  created_at: string;
};
