import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Avatar } from "@/components/Avatar";
import { CopyButton } from "@/components/CopyButton";
import { FormMessage } from "@/components/FormMessage";
import { getMood } from "@/lib/moods";
import { formatRelativeTime } from "@/lib/safety";
import { formatRemainingTime, isMoodSessionActive } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
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
  const currentMood = getMood(myMood?.mood_key);

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <Avatar src={profile.avatar_url} name={profile.handle_name} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-stone-500">あなたの会員コード</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <p className="font-mono text-2xl font-black tracking-widest">{profile.member_code}</p>
                <CopyButton value={profile.member_code} />
              </div>
              <p className="mt-1 text-sm text-stone-600">{profile.tagline || "一言未設定"}</p>
            </div>
          </div>

          <div className="mt-5"><FormMessage message={params.message} /></div>

          <div className="mt-6 rounded-[1.7rem] bg-stone-950 p-5 text-white shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-stone-300">現在の10分セッション</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-5xl">{currentMood?.icon}</span>
                  <div>
                    <h1 className="text-2xl font-black">{currentMood?.label}</h1>
                    <p className="text-sm text-stone-300">{currentMood?.description}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 px-3 py-2 text-right text-sm">
                <p className="text-stone-400">残り</p>
                <p className="font-black">{formatRemainingTime(myMood)}</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-stone-400">セッション開始: {formatRelativeTime(myMood?.session_started_at)}</p>
            <p className="mt-2 text-xs text-stone-500">セッション中は気分を変更できません。</p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-xl">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-pink-700">Friends</p>
              <h2 className="text-2xl font-black">友達の今</h2>
            </div>
            <p className="text-sm text-stone-500">{friendProfiles?.length ?? 0}人</p>
          </div>

          {friendProfiles && friendProfiles.length > 0 ? (
            <div className="mt-5 space-y-3">
              {friendProfiles.map((friend) => {
                const friendMood = moodByUser.get(friend.id);
                const mood = getMood(friendMood?.mood_key);
                const active = isMoodSessionActive(friendMood);

                return (
                  <article key={friend.id} className="flex items-center gap-3 rounded-3xl border border-stone-100 bg-white p-4 shadow-sm">
                    <Avatar src={friend.avatar_url} name={friend.handle_name} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-bold">{friend.handle_name}</h3>
                        {friend.tagline ? <span className="rounded-full bg-orange-50 px-2 py-1 text-xs text-orange-800">{friend.tagline}</span> : null}
                      </div>
                      <p className="mt-1 text-sm text-stone-600">{active && mood ? `${mood.icon} ${mood.label}` : "セッション外"}</p>
                    </div>
                    <p className="shrink-0 text-xs text-stone-500">{active ? formatRemainingTime(friendMood) : formatRelativeTime(friendMood?.session_expires_at)}</p>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="mt-6 rounded-3xl border border-dashed border-orange-200 p-5 text-sm leading-6 text-stone-600">まだ友達がいません。友達ページで会員コードから申請できます。</p>
          )}
        </section>
      </div>
    </AppShell>
  );
}
