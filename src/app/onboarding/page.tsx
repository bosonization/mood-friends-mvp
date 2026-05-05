import { redirect } from "next/navigation";
import { createProfile } from "./actions";
import { AvatarUploader } from "@/components/AvatarUploader";
import { FormMessage } from "@/components/FormMessage";
import { SubmitButton } from "@/components/SubmitButton";
import { createClient } from "@/lib/supabase/server";

type OnboardingPageProps = { searchParams: Promise<{ message?: string; invite?: string }> };

function normalizeToken(value: string | undefined) {
  return (value ?? "").replace(/[^0-9a-f]/gi, "").toLowerCase().slice(0, 32);
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const inviteFromParams = normalizeToken(params.invite);
  const inviteFromMetadata = normalizeToken(typeof user.user_metadata?.invite_token === "string" ? user.user_metadata.invite_token : "");
  const inviteToken = inviteFromParams.length === 32 ? inviteFromParams : inviteFromMetadata;

  const { data: profile } = await supabase.from("profiles").select("id, deleted_at").eq("id", user.id).maybeSingle<{ id: string; deleted_at: string | null }>();
  if (profile && !profile.deleted_at) redirect("/mood");

  return (
    <main className="mx-auto grid min-h-screen max-w-3xl items-center px-6 py-10">
      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-emerald-100 backdrop-blur-xl">
        <p className="mb-3 text-sm font-bold text-emerald-800">Welcome to NoriDrop</p>
        <h1 className="text-3xl font-black tracking-tight">プロフィールを作成</h1>
        <p className="mt-3 leading-7 text-stone-700">友達にだけ表示される情報です。連絡先、外部ID、集合場所などは入れない運用です。</p>
        {inviteToken.length === 32 ? <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-800">有効な招待リンクなら、登録完了後に自動で友達になります。</p> : null}
        <div className="mt-5"><FormMessage message={params.message} /></div>

        <form action={createProfile} className="mt-6 space-y-5">
          <input type="hidden" name="inviteToken" value={inviteToken} />
          <AvatarUploader name="avatarUrl" handleName="user" />
          <label className="block text-sm font-bold">ハンドルネーム<input className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-emerald-500" name="handleName" maxLength={30} required placeholder="例：yuki" /></label>
          <label className="block text-sm font-bold">一言（15文字以下）<input className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-emerald-500" name="tagline" maxLength={15} placeholder="例：夜ごはん行きたい" /></label>
          <label className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm"><input name="isAdult" type="checkbox" className="mt-1" /><span>20歳以上です<span className="block text-xs text-stone-500">お酒アイコンの扱いを安全にするため、正式版では年齢確認を強化してください。</span></span></label>
          <label className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4 text-sm">
            <input name="terms" type="checkbox" className="mt-1" required />
            <span><a href="/terms" target="_blank" rel="noreferrer" className="font-bold underline">利用規約</a>・<a href="/privacy" target="_blank" rel="noreferrer" className="font-bold underline">プライバシーポリシー</a>に同意します。</span>
          </label>
          <SubmitButton pendingText="作成中..." className="w-full rounded-2xl bg-gradient-to-r from-[#063f2e] via-[#0b6b47] to-[#12915f] px-5 py-3 font-black text-white shadow-lg shadow-emerald-100">作成する</SubmitButton>
        </form>
      </section>
    </main>
  );
}
