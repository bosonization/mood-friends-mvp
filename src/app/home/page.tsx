import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Avatar } from "@/components/Avatar";
import { FormMessage } from "@/components/FormMessage";
import { updateMood } from "./actions";
import { getMood, MOODS } from "@/lib/moods";
import { formatRelativeTime } from "@/lib/safety";
import { createClient } from "@/lib/supabase/server";
import type { Friendship, MoodStatus, Profile } from "@/lib/types";

type HomePageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (!profile || profile.deleted_at) redirect("/onboarding");

  const { data: myMood } = await supabase
    .from("mood_statuses")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<MoodStatus>();

  if (myMood) {
    await supabase
      .from("mood_statuses")
      .update({ last_login_at: new Date().toISOString() })
      .eq("user_id", user.id);
  }

  const { data: friendships } = await supabase
    .from("friendships")
    .select("*")
    .eq("status", "accepted")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .returns<Friendship[]>();

  const friendIds =
    friendships?.map((friendship) =>
      friendship.requester_id === user.id ? friendship.addressee_id : friendship.requester_id
    ) ?? [];

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
        <section className="rounded-[2rem] border border-orange-100 bg-white/85 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <Avatar src={profile.avatar_url} name={profile.handle_name} size="lg" />
            <div>
              <p className="text-sm text-stone-500">あなたの会員コード</p>
              <p className="font-mono text-2xl font-black tracking-widest">{profile.member_code}</p>
              <p className="mt-1 text-sm text-stone-600">{profile.tagline || "一言未設定"}</p>
            </div>
          </div>

          <div className="mt-6">
            <FormMessage
              message={
                params.message === "failed"
                  ? "気分の更新に失敗しました。"
                  : params.message === "invalid_mood"
                    ? "気分を選択してください。"
                    : params.message === "adult_required"
                      ? "お酒アイコンを選ぶには、プロフィールで20歳以上にチェックしてください。"
                      : null
              }
            />
          </div>

          {!currentMood ? (
            <div className="mt-6 rounded-3xl border border-orange-200 bg-orange-50 p-5">
              <h1 className="text-2xl font-black">まず今の気分を選んでください</h1>
              <p className="mt-2 text-sm leading-6 text-stone-700">
                トップページを使うには、最初に気分の共有が必要です。
              </p>
              <MoodPicker />
            </div>
          ) : (
            <div className="mt-6 rounded-3xl bg-stone-950 p-5 text-white">
              <p className="text-sm text-stone-300">今の気分</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-5xl">{currentMood.icon}</span>
                <div>
                  <h1 className="text-2xl font-black">{currentMood.label}</h1>
                  <p className="text-sm text-stone-300">{currentMood.description}</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-stone-400">
                ラストログイン: {formatRelativeTime(myMood?.last_login_at)}
              </p>
              <MoodPicker compact />
            </div>
          )}
        </section>

        <section className="rounded-[2rem] border border-orange-100 bg-white/85 p-5 shadow-sm">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-orange-700">Friends</p>
              <h2 className="text-2xl font-black">友達の今</h2>
            </div>
            <p className="text-sm text-stone-500">{friendProfiles?.length ?? 0}人</p>
          </div>

          {!currentMood ? (
            <p className="mt-6 rounded-3xl border border-dashed border-orange-200 p-5 text-sm leading-6 text-stone-600">
              あなたの気分を選ぶと、友達一覧が表示されます。
            </p>
          ) : friendProfiles && friendProfiles.length > 0 ? (
            <div className="mt-5 space-y-3">
              {friendProfiles.map((friend) => {
                const friendMood = moodByUser.get(friend.id);
                const mood = getMood(friendMood?.mood_key);

                return (
                  <article key={friend.id} className="flex items-center gap-3 rounded-3xl border border-stone-100 bg-white p-4">
                    <Avatar src={friend.avatar_url} name={friend.handle_name} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-bold">{friend.handle_name}</h3>
                        {friend.tagline ? (
                          <span className="rounded-full bg-orange-50 px-2 py-1 text-xs text-orange-800">
                            {friend.tagline}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-stone-600">
                        {mood ? `${mood.icon} ${mood.label}` : "まだ気分未設定"}
                      </p>
                    </div>
                    <p className="shrink-0 text-xs text-stone-500">
                      {formatRelativeTime(friendMood?.last_login_at)}
                    </p>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="mt-6 rounded-3xl border border-dashed border-orange-200 p-5 text-sm leading-6 text-stone-600">
              まだ友達がいません。友達ページで会員コードから申請できます。
            </p>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function MoodPicker({ compact = false }: { compact?: boolean }) {
  return (
    <form action={updateMood} className={compact ? "mt-5" : "mt-5"}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {MOODS.map((mood) => (
          <button
            key={mood.key}
            name="moodKey"
            value={mood.key}
            className={`rounded-3xl border px-3 py-4 text-left transition hover:scale-[1.02] ${
              compact
                ? "border-white/10 bg-white/10 hover:bg-white/15"
                : "border-orange-100 bg-white hover:border-orange-300"
            }`}
          >
            <span className="block text-3xl">{mood.icon}</span>
            <span className="mt-2 block font-bold">{mood.label}</span>
            <span className={`mt-1 block text-xs ${compact ? "text-stone-300" : "text-stone-500"}`}>
              {mood.description}
            </span>
          </button>
        ))}
      </div>
    </form>
  );
}
