export const MOOD_SESSION_MINUTES = 10;

export type MoodSessionLike = {
  session_started_at?: string | null;
  session_expires_at?: string | null;
};

export function isMoodSessionActive(session: MoodSessionLike | null | undefined) {
  if (!session?.session_expires_at) return false;
  return new Date(session.session_expires_at).getTime() > Date.now();
}

export function getSessionRemainingSeconds(session: MoodSessionLike | null | undefined) {
  if (!session?.session_expires_at) return 0;
  return Math.max(0, Math.floor((new Date(session.session_expires_at).getTime() - Date.now()) / 1000));
}

export function formatRemainingTime(session: MoodSessionLike | null | undefined) {
  const seconds = getSessionRemainingSeconds(session);
  if (seconds <= 0) return "期限切れ";
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;
  if (minutes <= 0) return `${restSeconds}秒`;
  return `${minutes}分${restSeconds.toString().padStart(2, "0")}秒`;
}

export function getElapsedHours(input: string | null | undefined) {
  if (!input) return Number.POSITIVE_INFINITY;
  return Math.max(0, (Date.now() - new Date(input).getTime()) / 1000 / 60 / 60);
}

export function getMoodFreshness(input: string | null | undefined) {
  const hours = getElapsedHours(input);
  if (hours <= 1) return "hot";
  if (hours <= 6) return "fresh";
  return "normal";
}
