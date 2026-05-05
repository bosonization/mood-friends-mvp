import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Avatar } from "@/components/Avatar";
import { CopyButton } from "@/components/CopyButton";
import { FormMessage } from "@/components/FormMessage";
import { ShareInviteButton } from "@/components/ShareInviteButton";
import { SubmitButton } from "@/components/SubmitButton";
import { acceptFriend, deleteFriend, rejectFriend, requestFriend, saveFriendMemo } from "./actions";
import { createClient } from "@/lib/supabase/server";
import type { FriendMemo, Friendship, Profile } from "@/lib/types";

type FriendsPageProps = { searchParams: Promise<{ message?: string }> };

export default async function FriendsPage({ searchParams }: FriendsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>();
  if (!profile) redirect("/onboarding");

  const { data: friendships } = await supabase
    .from("friendships")
    .select("*")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .order("updated_at", { ascending: false })
    .returns<Friendship[]>();

  const relatedIds = Array.from(new Set((friendships ?? []).map((friendship) => friendship.requester_id === user.id ? friendship.addressee_id : friendship.requester_id)));
  const { data: relatedProfiles } = relatedIds.length ? await supabase.from("profiles").select("*").in("id", relatedIds).returns<Profile[]>() : { data: [] as Profile[] };
  const profileById = new Map((relatedProfiles ?? []).map((item) => [item.id, item]));
  const { data: friendMemos } = relatedIds.length
    ? await supabase.from("friend_memos").select("*").eq("owner_id", user.id).in("friend_id", relatedIds).returns<FriendMemo[]>()
    : { data: [] as FriendMemo[] };
  const memoByFriendId = new Map((friendMemos ?? []).map((memo) => [memo.friend_id, memo.note]));

  const accepted = (friendships ?? []).filter((item) => item.status === "accepted");
  const receivedPending = (friendships ?? []).filter((item) => item.status === "pending" && item.addressee_id === user.id);
  const sentPending = (friendships ?? []).filter((item) => item.status === "pending" && item.requester_id === user.id);

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
        <section className="space-y-5">
          <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-xl">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-pink-700">Friend Code</p>
                <h1 className="text-2xl font-black">友達を追加</h1>
                <p className="mt-2 text-sm leading-6 text-stone-600">10桁コードで知っている相手にだけ申請できます。</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 px-3 py-2 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-400">My Code</span>
                <span className="font-mono text-sm font-black tracking-widest text-stone-900">{profile.member_code}</span>
                <CopyButton value={profile.member_code} />
              </div>
            </div>
            <form action={requestFriend} className="mt-5 space-y-3">
              <label className="block text-sm font-bold">相手の会員コード<input className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 font-mono tracking-widest outline-none focus:border-pink-400" name="memberCode" inputMode="numeric" maxLength={10} placeholder="1234567890" required /></label>
              <SubmitButton pendingText="申請中..." className="w-full rounded-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 px-5 py-3 font-black text-white shadow-lg shadow-pink-100">申請する</SubmitButton>
            </form>
            <div className="mt-5"><FormMessage message={params.message} /></div>
          </div>

          <ShareInviteButton memberCode={profile.member_code} handleName={profile.handle_name} variant="card" />
        </section>

        <section className="space-y-5">
          <FriendshipSection title="承認待ち" empty="届いている申請はありません。">
            {receivedPending.map((friendship) => { const other = profileById.get(friendship.requester_id); if (!other) return null; return <FriendshipCard key={friendship.id} profile={other}><div className="flex gap-2"><form action={acceptFriend}><input type="hidden" name="friendshipId" value={friendship.id} /><SubmitButton pendingText="承認中..." className="rounded-full bg-stone-950 px-4 py-2 text-sm font-bold text-white">承認</SubmitButton></form><form action={rejectFriend}><input type="hidden" name="friendshipId" value={friendship.id} /><SubmitButton pendingText="拒否中..." className="rounded-full border border-stone-200 px-4 py-2 text-sm">拒否</SubmitButton></form></div></FriendshipCard>; })}
          </FriendshipSection>

          <FriendshipSection title="申請中" empty="送信中の申請はありません。">
            {sentPending.map((friendship) => { const other = profileById.get(friendship.addressee_id); if (!other) return null; return <FriendshipCard key={friendship.id} profile={other}><form action={deleteFriend}><input type="hidden" name="friendshipId" value={friendship.id} /><SubmitButton pendingText="取消中..." className="rounded-full border border-stone-200 px-4 py-2 text-sm">取消</SubmitButton></form></FriendshipCard>; })}
          </FriendshipSection>

          <FriendshipSection title="友達" empty="まだ友達はいません。">
            {accepted.map((friendship) => {
              const otherId = friendship.requester_id === user.id ? friendship.addressee_id : friendship.requester_id;
              const other = profileById.get(otherId);
              if (!other) return null;
              return (
                <FriendshipCard key={friendship.id} profile={other} memo={memoByFriendId.get(other.id) ?? ""} editableMemo>
                  <form action={deleteFriend}>
                    <input type="hidden" name="friendshipId" value={friendship.id} />
                    <SubmitButton pendingText="削除中..." className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-700">削除</SubmitButton>
                  </form>
                </FriendshipCard>
              );
            })}
          </FriendshipSection>
        </section>
      </div>
    </AppShell>
  );
}

function FriendshipSection({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  const items = Array.isArray(children) ? children.filter(Boolean) : children;
  return <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-xl"><h2 className="text-xl font-black">{title}</h2><div className="mt-4 space-y-3">{Array.isArray(items) && items.length === 0 ? <p className="rounded-3xl border border-dashed border-orange-200 p-5 text-sm text-stone-600">{empty}</p> : items}</div></div>;
}

function FriendshipCard({ profile, children, memo = "", editableMemo = false }: { profile: Profile; children: React.ReactNode; memo?: string; editableMemo?: boolean }) {
  return (
    <article className="rounded-3xl border border-stone-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar src={profile.avatar_url} name={profile.handle_name} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold">{profile.handle_name}</p>
          <p className="truncate text-sm text-stone-500">{profile.tagline || "一言未設定"}</p>
          {memo ? <p className="mt-1 inline-flex max-w-full rounded-full bg-gradient-to-r from-cyan-50 to-fuchsia-50 px-2.5 py-1 text-[11px] font-bold text-stone-600">自分メモ：<span className="truncate">{memo}</span></p> : null}
        </div>
        <div className="shrink-0">{children}</div>
      </div>
      {editableMemo ? (
        <form action={saveFriendMemo} className="mt-3 rounded-[1.25rem] border border-stone-100 bg-stone-50/70 p-3">
          <input type="hidden" name="friendId" value={profile.id} />
          <label className="block text-[11px] font-black uppercase tracking-[0.18em] text-stone-400">Private memo</label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              name="note"
              defaultValue={memo}
              maxLength={80}
              placeholder="例：高校の友達 / 田中さん / Apex仲間"
              className="min-w-0 flex-1 rounded-2xl border border-white bg-white px-4 py-3 text-sm font-bold outline-none transition focus:border-fuchsia-300 focus:ring-4 focus:ring-fuchsia-100"
            />
            <SubmitButton pendingText="保存中..." className="rounded-2xl bg-stone-950 px-4 py-3 text-sm font-black text-white shadow-sm hover:bg-stone-800">保存</SubmitButton>
          </div>
          <p className="mt-2 text-[11px] leading-5 text-stone-400">相手には見えません。空で保存すると削除されます。</p>
        </form>
      ) : null}
    </article>
  );
}
