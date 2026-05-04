import type { MoodKey } from "@/lib/moods";

export type UserLevel = 1 | 2 | 3 | 4 | 5;

export type LevelStatus = {
  level: UserLevel;
  computedLevel: UserLevel;
  friendCount: number;
  referralCount: number;
  nextFriendGoal: number | null;
  needsReferralForLv5: boolean;
  label: string;
  nextMessage: string;
};

type SupabaseLike = {
  from: (table: string) => any;
};

export const LEVEL_LABELS: Record<UserLevel, string> = {
  1: "はじまり",
  2: "友達ができた",
  3: "広がり中",
  4: "全気分解放",
  5: "Spotlight"
};

export const MOOD_UNLOCK_LEVEL: Record<MoodKey, UserLevel> = {
  food: 1,
  movie: 1,
  game: 1,
  cafe: 1,
  walk: 2,
  work: 3,
  drink: 4,
  travel: 4
};

export function calculateLevel(friendCount: number, referralCount: number): UserLevel {
  if (friendCount >= 3 && referralCount >= 1) return 5;
  if (friendCount >= 3) return 4;
  if (friendCount >= 2) return 3;
  if (friendCount >= 1) return 2;
  return 1;
}

export function normalizeLevel(value: number | null | undefined): UserLevel {
  if (value === 5) return 5;
  if (value === 4) return 4;
  if (value === 3) return 3;
  if (value === 2) return 2;
  return 1;
}

export function isMoodUnlocked(moodKey: MoodKey, level: UserLevel) {
  return MOOD_UNLOCK_LEVEL[moodKey] <= level;
}

export function getNextFriendGoal(level: UserLevel, friendCount: number) {
  if (level <= 1) return 1;
  if (level <= 2) return 2;
  if (level <= 3) return 3;
  if (level === 4 && friendCount < 3) return 3;
  return null;
}

export function buildLevelStatus(maxLevel: UserLevel, friendCount: number, referralCount: number): LevelStatus {
  const computedLevel = calculateLevel(friendCount, referralCount);
  const level = normalizeLevel(Math.max(maxLevel, computedLevel));
  const nextFriendGoal = getNextFriendGoal(level, friendCount);
  const needsReferralForLv5 = level < 5 && friendCount >= 3 && referralCount < 1;

  let nextMessage = "Lv5 Spotlight解放済み。1日1回、30分だけ気分を強調できます。";
  if (level < 2) nextMessage = "友達を1人追加すると、散歩が解放されます。";
  else if (level < 3) nextMessage = "友達を2人にすると、作業が解放されます。";
  else if (level < 4) nextMessage = "友達を3人にすると、すべての気分が解放されます。";
  else if (level < 5) nextMessage = "招待コード経由で1人登録されると、Spotlightが解放されます。";

  return {
    level,
    computedLevel,
    friendCount,
    referralCount,
    nextFriendGoal,
    needsReferralForLv5,
    label: LEVEL_LABELS[level],
    nextMessage
  };
}

export async function getAndSyncLevelStatus(supabase: SupabaseLike, userId: string, currentMaxLevel: number | null | undefined) {
  const [{ count: friendCountRaw }, { count: referralCountRaw }] = await Promise.all([
    supabase
      .from("friendships")
      .select("id", { count: "exact", head: true })
      .eq("status", "accepted")
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`),
    supabase
      .from("referrals")
      .select("id", { count: "exact", head: true })
      .eq("inviter_id", userId)
  ]);

  const friendCount = friendCountRaw ?? 0;
  const referralCount = referralCountRaw ?? 0;
  const currentMax = normalizeLevel(currentMaxLevel ?? 1);
  const status = buildLevelStatus(currentMax, friendCount, referralCount);

  if (status.level > currentMax) {
    await supabase.from("profiles").update({ max_level: status.level }).eq("id", userId);
  }

  return status;
}
