import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { FirstLinkCelebration } from "@/components/FirstLinkCelebration";
import { FirstLinkChallenge } from "@/components/FirstLinkChallenge";
import { FormMessage } from "@/components/FormMessage";
import { FriendsMoodDisplay, type FriendMoodViewItem } from "@/components/FriendsMoodDisplay";
import { LevelCard } from "@/components/LevelCard";
import { NoriCardShare } from "@/components/NoriCardShare";
import { getMood } from "@/lib/moods";
import { formatRelativeTime } from "@/lib/safety";
import { formatRemainingTime, getMoodFreshness, isMoodSessionActive } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { getAndSyncLevelStatus } from "@/lib/level";
import { normalizeViewMode } from "@/lib/viewMode";
import type { Friendship, MoodSpotlight, MoodStatus, Profile } from "@/lib/types";

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
  if (!isMoodSessionActive(myMood)) redirect("/mood");

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

  const spotlightByUser = new Map((activeSpotlights ?? []).map((spotlight) => [spotlight.user_id, spotlight]));
  const moodByUser = new Map((friendMoods ?? []).map((mood) => [mood.user_id, mood]));
  const currentMood = getMood(myMood?.mood_key);
  const mySpotlight = spotlightByUser.get(user.id) ?? null;

  const friendsForView: FriendMoodViewItem[] = (friendProfiles ?? []).map((friend) => {
    const friendMood = moodByUser.get(friend.id);
    const mood = getMood(friendMood?.mood_key);
    const active = isMoodSessionActive(friendMood);
    const spotlight = spotlightByUser.get(friend.id) ?? null;

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
      spotlightExpiresAt: spotlight?.expires_at ?? null
    };
  });

  return (
    <AppShell>
      <FirstLinkCelebration friendCount={levelStatus.friendCount} level={levelStatus.level} />

      <div className="space-y-6">
        <LevelCard
          status={levelStatus}
          memberCode={profile.member_code}
          handleName={profile.handle_name}
          hasActiveMood={isMoodSessionActive(myMood)}
          spotlightActive={Boolean(mySpotlight)}
          spotlightUsedToday={Boolean(todaySpotlight)}
        />

        <FirstLinkChallenge friendCount={levelStatus.friendCount} memberCode={profile.member_code} handleName={profile.handle_name} />

        {currentMood ? (
          <NoriCardShare
            memberCode={profile.member_code}
            handleName={profile.handle_name}
            moodIcon={currentMood.icon}
            moodLabel={currentMood.label}
            moodDescription={currentMood.description}
            remainingTime={formatRemainingTime(myMood)}
            spotlightActive={Boolean(mySpotlight)}
          />
        ) : null}

        <div className="-mt-2"><FormMessage message={params.message} /></div>

        <FriendsMoodDisplay items={friendsForView} initialViewMode={normalizeViewMode(profile.display_mode)} inviteCode={profile.member_code} ownerName={profile.handle_name} />
      </div>
    </AppShell>
  );
}
