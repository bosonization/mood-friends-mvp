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
  avatarCompleted: boolean;
  noriUpdateCount: number;
  cappedNoriUpdateCount: number;
  growthPoints: number;
  nextActionLabel: string;
  nextUnlockLabel: string | null;
  seedStage: string;
  seedEmoji: string;
  spotlightUnlocked: boolean;
};

type SupabaseLike = {
  from: (table: string) => any;
};

export const LEVEL_LABELS: Record<UserLevel, string> = {
  1: "赤ちゃんノリ",
  2: "よちよちノリ",
  3: "わんぱくノリ",
  4: "イケノリ",
  5: "オトナノリ"
};

export const LEVEL_SEED_EMOJI: Record<UserLevel, string> = {
  1: "◼︎",
  2: "◼︎",
  3: "◼︎",
  4: "◼︎",
  5: "◼︎"
};

export const MOOD_UNLOCK_LEVEL: Record<MoodKey, UserLevel> = {
  food: 1,
  movie: 1,
  cafe: 1,
  drink: 1,
  game: 2,
  walk: 3,
  work: 4,
  travel: 5
};

export const LEVEL_UNLOCK_LABELS: Record<UserLevel, string> = {
  1: "ごはん / 話す / チル / 飲み",
  2: "ゲーム",
  3: "外出",
  4: "もくもく",
  5: "何かしたい"
};

export function calculateLevel(avatarCompleted: boolean, noriUpdateCount: number): UserLevel {
  const avatarPoint = avatarCompleted ? 1 : 0;
  const updatePoints = Math.min(Math.max(noriUpdateCount, 0), 3);
  const rawLevel = 1 + avatarPoint + updatePoints;
  if (rawLevel >= 5) return 5;
  if (rawLevel >= 4) return 4;
  if (rawLevel >= 3) return 3;
  if (rawLevel >= 2) return 2;
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

function getNextAction(avatarCompleted: boolean, noriUpdateCount: number, level: UserLevel) {
  if (level >= 5) return "招待1人でSpotlight";
  if (!avatarCompleted) return "画像を登録";
  const nextCount = Math.min(noriUpdateCount + 1, 3);
  return `ノリ${nextCount}回目へ`;
}

function getNextUnlock(level: UserLevel) {
  if (level < 2) return "次に解放：ゲーム";
  if (level < 3) return "次に解放：外出";
  if (level < 4) return "次に解放：もくもく";
  if (level < 5) return "次に解放：何かしたい";
  return null;
}

export function getNextFriendGoal(_level: UserLevel, friendCount: number) {
  return friendCount < 1 ? 1 : null;
}

export function buildLevelStatus(params: {
  maxLevel: UserLevel;
  avatarCompleted: boolean;
  noriUpdateCount: number;
  friendCount: number;
  referralCount: number;
}): LevelStatus {
  const { maxLevel, avatarCompleted, noriUpdateCount, friendCount, referralCount } = params;
  const computedLevel = calculateLevel(avatarCompleted, noriUpdateCount);
  const level = normalizeLevel(Math.max(maxLevel, computedLevel));
  const cappedNoriUpdateCount = Math.min(Math.max(noriUpdateCount, 0), 3);
  const growthPoints = (avatarCompleted ? 1 : 0) + cappedNoriUpdateCount;
  const spotlightUnlocked = level >= 5 && referralCount >= 1;
  const needsReferralForLv5 = level >= 5 && referralCount < 1;
  const nextUnlockLabel = getNextUnlock(level);
  let nextMessage = getNextAction(avatarCompleted, noriUpdateCount, level);
  if (spotlightUnlocked) nextMessage = "Spotlight解放済み";
  else if (level >= 5) nextMessage = "招待1人でSpotlight解放";

  return {
    level,
    computedLevel,
    friendCount,
    referralCount,
    nextFriendGoal: getNextFriendGoal(level, friendCount),
    needsReferralForLv5,
    label: LEVEL_LABELS[level],
    nextMessage,
    avatarCompleted,
    noriUpdateCount,
    cappedNoriUpdateCount,
    growthPoints,
    nextActionLabel: getNextAction(avatarCompleted, noriUpdateCount, level),
    nextUnlockLabel,
    seedStage: LEVEL_LABELS[level],
    seedEmoji: LEVEL_SEED_EMOJI[level],
    spotlightUnlocked
  };
}

export async function getAndSyncLevelStatus(supabase: SupabaseLike, userId: string, currentMaxLevel: number | null | undefined) {
  const [{ data: profile }, { count: friendCountRaw }, { count: referralCountRaw }] = await Promise.all([
    supabase
      .from("profiles")
      .select("avatar_url,nori_update_count,max_level")
      .eq("id", userId)
      .maybeSingle(),
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

  const typedProfile = profile as { avatar_url: string | null; nori_update_count: number | null; max_level: number | null } | null;
  const friendCount = friendCountRaw ?? 0;
  const referralCount = referralCountRaw ?? 0;
  const avatarCompleted = Boolean(typedProfile?.avatar_url);
  const noriUpdateCount = typedProfile?.nori_update_count ?? 0;
  const currentMax = normalizeLevel(typedProfile?.max_level ?? currentMaxLevel ?? 1);
  const status = buildLevelStatus({ maxLevel: currentMax, avatarCompleted, noriUpdateCount, friendCount, referralCount });

  if (status.level > currentMax) {
    await supabase.from("profiles").update({ max_level: status.level }).eq("id", userId);
  }

  return status;
}
