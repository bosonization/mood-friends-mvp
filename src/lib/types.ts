import type { ViewMode } from "@/lib/viewMode";

export type Profile = {
  id: string;
  member_code: string;
  handle_name: string;
  tagline: string;
  avatar_url: string | null;
  is_adult: boolean;
  display_mode?: ViewMode | null;
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
  created_at: string;
  updated_at: string;
};
