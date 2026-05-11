import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { DailyNoriCard } from "@/components/DailyNoriCard";
import { FirstLinkCelebration } from "@/components/FirstLinkCelebration";
import { FirstLinkChallenge } from "@/components/FirstLinkChallenge";
import { FormMessage } from "@/components/FormMessage";
import { FriendsMoodDisplay, type FriendMoodViewItem } from "@/components/FriendsMoodDisplay";
import { LevelCard } from "@/components/LevelCard";
import { NoriCardShare } from "@/components/NoriCardShare";
import { NoriTutorial } from "@/components/NoriTutorial";
import { getMood } from "@/lib/moods";
import { formatRelativeTime } from "@/lib/safety";
import { formatRemainingTime, getMoodFreshness, isMoodSessionActive } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { getAndSyncLevelStatus } from "@/lib/level";
import { CURRENT_TUTORIAL_VERSION } from "@/lib/tutorial";
import { normalizeViewMode } from "@/lib/viewMode";
import type { DailyNoriStatus, FriendMemo, Friendship, MoodEntry, MoodReaction, MoodSpotlight, MoodStatus, Profile } from "@/lib/types";

type HomePageProps = { searchParams: Promise<{ message?: string }> };

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>();
  if (!profile || profile.deleted_at) redirect("/onboarding");

  const levelStatus = await getAndSyncLevelStatus(supabase, user.id, profile.max_level);

  const { data: myMood } = await supabase.from("mood_statuses").select("*").eq("user_id", user.id).maybeSingle<MoodStatus>();
  const moodActive = isMoodSessionActive(myMood);
  const { data: todayStealth } = await supabase
    .from("nori_stealth_uses")
    .select("id")
    .eq("user_id", user.id)
    .eq("use_date", todayKey())
    .maybeSingle<{ id: string }>();
  const stealthActive = Boolean(myMood?.current_entry_id && !moodActive && todayStealth);
  if (!moodActive && !stealthActive) redirect("/mood");

  const { data: friendships } = await supabase
    .from("friendships")
    .select("*")
    .eq("status", "accepted")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .returns<Friendship[]>();

  const friendIds = friendships?.map((friendship) => friendship.requester_id === user.id ? friendship.addressee_id : friendship.requester_id) ?? [];
  const { data: friendProfiles } = friendIds.length
    ? await supabase.from("profiles").select("*").in("id", friendIds).returns<Profile[]>()
    : { data: [] as Profile[] };
  const { data: friendMoods } = friendIds.length
    ? await supabase.from("mood_statuses").select("*").in("user_id", friendIds).returns<MoodStatus[]>()
    : { data: [] as MoodStatus[] };
  const { data: friendMemos } = friendIds.length
    ? await supabase.from("friend_memos").select("*").eq("owner_id", user.id).in("friend_id", friendIds).returns<FriendMemo[]>()
    : { data: [] as FriendMemo[] };
  const memoByFriendId = new Map((friendMemos ?? []).map((memo) => [memo.friend_id, memo.note]));

  const spotlightIds = [user.id, ...friendIds];
  const { data: activeSpotlights } = spotlightIds.length
    ? await supabase
        .from("mood_spotlights")
        .select("*")
        .in("user_id", spotlightIds)
        .gt("expires_at", new Date().toISOString())
        .returns<MoodSpotlight[]>()
    : { data: [] as MoodSpotlight[] };

  const { data: todaySpotlight } = await supabase
    .from("mood_spotlights")
    .select("*")
    .eq("user_id", user.id)
    .eq("spotlight_date", todayKey())
    .maybeSingle<MoodSpotlight>();

  const { data: previousMoodEntry } = myMood?.current_entry_id
    ? await supabase
        .from("mood_entries")
        .select("*")
        .eq("user_id", user.id)
        .neq("id", myMood.current_entry_id)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle<MoodEntry>()
    : { data: null as MoodEntry | null };

  const { data: dailyNoriRows } = await supabase.rpc("get_daily_nori_status");
  const dailyNori = Array.isArray(dailyNoriRows)
    ? (dailyNoriRows[0] as DailyNoriStatus | undefined)
    : (dailyNoriRows as DailyNoriStatus | null);

  const reactionEntryIds = [
    myMood?.current_entry_id,
    previousMoodEntry?.id,
    ...(friendMoods ?? []).map((mood) => mood.current_entry_id)
  ].filter(Boolean) as string[];

  const { data: reactions } = reactionEntryIds.length
    ? await supabase
        .from("mood_reactions")
        .select("*")
        .in("mood_entry_id", reactionEntryIds)
        .returns<MoodReaction[]>()
    : { data: [] as MoodReaction[] };

  const reactionActorIds = Array.from(new Set((reactions ?? []).map((reaction) => reaction.actor_id)));
  const { data: reactionActors } = reactionActorIds.length
    ? await supabase
        .from("profiles")
        .select("id, handle_name")
        .in("id", reactionActorIds)
        .returns<Pick<Profile, "id" | "handle_name">[]>()
    : { data: [] as Pick<Profile, "id" | "handle_name">[] };

  const reactionActorById = new Map((reactionActors ?? []).map((actor) => [actor.id, actor.handle_name]));
  const reactionsByEntryId = new Map<string, MoodReaction[]>();
  for (const reaction of reactions ?? []) {
    const list = reactionsByEntryId.get(reaction.mood_entry_id) ?? [];
    list.push(reaction);
    reactionsByEntryId.set(reaction.mood_entry_id, list);
  }

  const spotlightByUser = new Map((activeSpotlights ?? []).map((spotlight) => [spotlight.user_id, spotlight]));
  const moodByUser = new Map((friendMoods ?? []).map((mood) => [mood.user_id, mood]));
  const currentMood = getMood(myMood?.mood_key);
  const mySpotlight = spotlightByUser.get(user.id) ?? null;

  const friendsForView: FriendMoodViewItem[] = (friendProfiles ?? []).map((friend) => {
    const friendMood = moodByUser.get(friend.id);
    const mood = getMood(friendMood?.mood_key);
    const active = isMoodSessionActive(friendMood);
    const spotlight = spotlightByUser.get(friend.id) ?? null;

    const entryReactions = friendMood?.current_entry_id ? reactionsByEntryId.get(friendMood.current_entry_id) ?? [] : [];

    return {
      id: friend.id,
      handleName: friend.handle_name,
      tagline: friend.tagline,
      avatarUrl: friend.avatar_url,
      moodIcon: mood?.icon ?? null,
      moodLabel: mood?.label ?? null,
      moodDescription: mood?.description ?? null,
      lastLoginAt: friendMood?.last_login_at ?? null,
      relativeTime: formatRelativeTime(friendMood?.last_login_at),
      remainingTime: active ? formatRemainingTime(friendMood) : null,
      active,
      freshness: getMoodFreshness(friendMood?.last_login_at),
      spotlightActive: Boolean(spotlight),
      spotlightExpiresAt: spotlight?.expires_at ?? null,
      currentEntryId: friendMood?.current_entry_id ?? null,
      likedByMe: entryReactions.some((reaction) => reaction.actor_id === user.id),
      likeCount: entryReactions.length,
      friendMemo: memoByFriendId.get(friend.id) ?? null
    };
  });

  const currentMoodReactions = myMood?.current_entry_id ? reactionsByEntryId.get(myMood.current_entry_id) ?? [] : [];
  const previousMoodReactions = previousMoodEntry?.id ? reactionsByEntryId.get(previousMoodEntry.id) ?? [] : [];
  const previousMood = getMood(previousMoodEntry?.mood_key);
  const likeSummary = {
    currentCount: currentMoodReactions.length,
    currentNames: currentMoodReactions.map((reaction) => reactionActorById.get(reaction.actor_id) ?? "友達"),
    previousCount: previousMoodReactions.length,
    previousNames: previousMoodReactions.map((reaction) => reactionActorById.get(reaction.actor_id) ?? "友達"),
    previousMoodIcon: previousMood?.icon ?? null,
    previousMoodLabel: previousMood?.label ?? null
  };

  const forceTutorial = (profile.tutorial_version ?? 0) < CURRENT_TUTORIAL_VERSION;
  const showTutorialLauncher = levelStatus.level >= 3;

  return (
    <AppShell>
      <FirstLinkCelebration friendCount={levelStatus.friendCount} level={levelStatus.level} />

      <div className="space-y-6">
        <NoriTutorial forceOpen={forceTutorial} showLauncher={showTutorialLauncher} />

        <LevelCard
          status={levelStatus}
          memberCode={profile.member_code}
          handleName={profile.handle_name}
          hasActiveMood={moodActive || stealthActive}
          spotlightActive={Boolean(mySpotlight)}
          spotlightUsedToday={Boolean(todaySpotlight)}
        />

        <FirstLinkChallenge friendCount={levelStatus.friendCount} memberCode={profile.member_code} handleName={profile.handle_name} />

        <DailyNoriCard
          todayDone={Boolean(dailyNori?.today_done)}
          streak={dailyNori?.streak ?? 0}
          moodIcon={currentMood?.icon ?? null}
          moodLabel={currentMood?.label ?? null}
          stealthActive={stealthActive}
        />

        {currentMood ? (
          <NoriCardShare
            memberCode={profile.member_code}
            handleName={profile.handle_name}
            moodIcon={currentMood.icon}
            moodLabel={currentMood.label}
            moodDescription={currentMood.description}
            remainingTime={stealthActive ? "Quiet" : formatRemainingTime(myMood)}
            spotlightActive={Boolean(mySpotlight)}
            stealthActive={stealthActive}
            likeSummary={likeSummary}
          />
        ) : null}

        <div className="-mt-2"><FormMessage message={params.message} /></div>

        <FriendsMoodDisplay items={friendsForView} initialViewMode={normalizeViewMode(profile.display_mode)} inviteCode={profile.member_code} ownerName={profile.handle_name} />
      </div>
    </AppShell>
  );
}
