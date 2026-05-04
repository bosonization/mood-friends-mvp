import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Avatar } from "@/components/Avatar";
import { CopyButton } from "@/components/CopyButton";
import { ShareInviteButton } from "@/components/ShareInviteButton";
import { FormMessage } from "@/components/FormMessage";
import { FriendsMoodDisplay, type FriendMoodViewItem } from "@/components/FriendsMoodDisplay";
import { getMood } from "@/lib/moods";
import { formatRelativeTime } from "@/lib/safety";
import { formatRemainingTime, getMoodFreshness, isMoodSessionActive } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { normalizeViewMode } from "@/lib/viewMode";
import type { Friendship, MoodStatus, Profile } from "@/lib/types";

type HomePageProps = { searchParams: Promise<{ message?: string }> };

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>();
  if (!profile || profile.deleted_at) redirect("/onboarding");

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

  const moodByUser = new Map((friendMoods ?? []).map((mood) => [mood.user_id, mood]));
  const currentMood = getMood(myMood?.mood_key, { viewerIsAdult: profile.is_adult, ownerIsAdult: profile.is_adult });
  const friendsForView: FriendMoodViewItem[] = (friendProfiles ?? []).map((friend) => {
    const friendMood = moodByUser.get(friend.id);
    const mood = getMood(friendMood?.mood_key, { viewerIsAdult: profile.is_adult, ownerIsAdult: friend.is_adult });
    const active = isMoodSessionActive(friendMood);

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
      freshness: getMoodFreshness(friendMood?.last_login_at)
    };
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <FriendsMoodDisplay items={friendsForView} initialViewMode={normalizeViewMode(profile.display_mode)} inviteCode={profile.member_code} ownerName={profile.handle_name} />

        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <Avatar src={profile.avatar_url} name={profile.handle_name} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-stone-500">あなたの会員コード</p>
              <div className="mt-1 flex flex-wrap items-center gap-2"><p className="font-mono text-2xl font-black tracking-widest">{profile.member_code}</p><CopyButton value={profile.member_code} /><ShareInviteButton memberCode={profile.member_code} handleName={profile.handle_name} /></div>
              <p className="mt-1 text-sm text-stone-600">{profile.tagline || "一言未設定"}</p>
            </div>
          </div>
          <div className="mt-5"><FormMessage message={params.message} /></div>
          <div className="mt-6 rounded-[1.7rem] bg-stone-950 p-5 text-white shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-sm text-stone-300">現在の10分セッション</p><div className="mt-3 flex items-center gap-3"><span className="text-5xl">{currentMood?.icon}</span><div><h1 className="text-2xl font-black">{currentMood?.label}</h1><p className="text-sm text-stone-300">{currentMood?.description}</p></div></div></div>
              <div className="rounded-2xl bg-white/10 px-3 py-2 text-right text-sm"><p className="text-stone-400">残り</p><p className="font-black">{formatRemainingTime(myMood)}</p></div>
            </div>
            <p className="mt-4 text-xs text-stone-400">セッション開始: {formatRelativeTime(myMood?.session_started_at)}</p>
            <p className="mt-2 text-xs text-stone-500">セッション中は気分を変更できません。</p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
