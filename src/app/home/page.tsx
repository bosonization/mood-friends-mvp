import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Avatar } from "@/components/Avatar";
import { FormMessage } from "@/components/FormMessage";
import { FriendsMoodDisplay, type FriendMoodViewItem } from "@/components/FriendsMoodDisplay";
import { LevelCard } from "@/components/LevelCard";
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
      <div className="space-y-6">
        <LevelCard
          status={levelStatus}
          memberCode={profile.member_code}
          handleName={profile.handle_name}
          hasActiveMood={isMoodSessionActive(myMood)}
          spotlightActive={Boolean(mySpotlight)}
          spotlightUsedToday={Boolean(todaySpotlight)}
        />

        <FriendsMoodDisplay items={friendsForView} initialViewMode={normalizeViewMode(profile.display_mode)} inviteCode={profile.member_code} ownerName={profile.handle_name} />

        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <Avatar src={profile.avatar_url} name={profile.handle_name} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-pink-700">あなたの今</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="text-5xl">{currentMood?.icon}</span>
                <div>
                  <h2 className="text-2xl font-black">{currentMood?.label}</h2>
                  <p className="text-sm text-stone-500">変更まであと {formatRemainingTime(myMood)}</p>
                </div>
              </div>
              {mySpotlight ? <p className="mt-3 inline-flex rounded-full bg-fuchsia-50 px-3 py-1 text-xs font-black text-fuchsia-700">✨ Spotlight中</p> : null}
            </div>
          </div>
          <div className="mt-5"><FormMessage message={params.message} /></div>
        </section>
      </div>
    </AppShell>
  );
}
