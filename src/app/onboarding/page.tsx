import { redirect } from "next/navigation";
import { createProfile } from "./actions";
import { AvatarUploader } from "@/components/AvatarUploader";
import { FormMessage } from "@/components/FormMessage";
import { SubmitButton } from "@/components/SubmitButton";
import { createClient } from "@/lib/supabase/server";

type OnboardingPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, deleted_at")
    .eq("id", user.id)
    .maybeSingle<{ id: string; deleted_at: string | null }>();

  if (profile && !profile.deleted_at) redirect("/mood");

  return (
    <main className="mx-auto grid min-h-screen max-w-3xl items-center px-6 py-10">
      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-orange-100 backdrop-blur-xl">
        <p className="mb-3 text-sm font-bold text-pink-700">Welcome to eMoodition</p>
        <h1 className="text-3xl font-black tracking-tight">プロフィールを作成</h1>
        <p className="mt-3 leading-7 text-stone-700">
          友達にだけ表示される情報です。連絡先、外部ID、集合場所などは入れない運用です。
        </p>
        <div className="mt-5">
          <FormMessage message={params.message} />
        </div>

        <form action={createProfile} className="mt-6 space-y-5">
          <AvatarUploader name="avatarUrl" handleName="user" />

          <label className="block text-sm font-bold">
            ハンドルネーム
            <input
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-pink-400"
              name="handleName"
              maxLength={30}
              required
              placeholder="例：yuki"
            />
          </label>

          <label className="block text-sm font-bold">
            一言（15文字以下）
            <input
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-pink-400"
              name="tagline"
              maxLength={15}
              placeholder="例：夜ごはん行きたい"
            />
          </label>

          <label className="flex items-start gap-3 rounded-2xl border border-orange-100 bg-orange-50/70 p-4 text-sm">
            <input name="isAdult" type="checkbox" className="mt-1" />
            <span>
              20歳以上です
              <span className="block text-xs text-stone-500">
                お酒アイコンの扱いを安全にするため、正式版では年齢確認を強化してください。
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4 text-sm">
            <input name="terms" type="checkbox" className="mt-1" required />
            <span>
              <a href="/terms" target="_blank" rel="noreferrer" className="font-bold underline decoration-dotted underline-offset-4">
                利用規約
              </a>
              ・
              <a href="/privacy" target="_blank" rel="noreferrer" className="font-bold underline decoration-dotted underline-offset-4">
                プライバシーポリシー
              </a>
              に同意します。
              <span className="mt-1 block text-xs text-stone-500">
                規約・ポリシーは別タブで開くため、入力中の内容はこの画面に残ります。
              </span>
            </span>
          </label>

          <SubmitButton pendingText="作成中..." className="w-full rounded-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 px-5 py-3 font-black text-white shadow-lg shadow-pink-100">
            作成する
          </SubmitButton>
        </form>
      </section>
    </main>
  );
}
