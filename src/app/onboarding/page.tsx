import { redirect } from "next/navigation";
import { createProfile } from "./actions";
import { AvatarUploader } from "@/components/AvatarUploader";
import { FormMessage } from "@/components/FormMessage";
import { SubmitButton } from "@/components/SubmitButton";
import { TransitionLink } from "@/components/TransitionLink";
import { createClient } from "@/lib/supabase/server";

type OnboardingPageProps = { searchParams: Promise<{ message?: string }> };

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("id, deleted_at").eq("id", user.id).maybeSingle<{ id: string; deleted_at: string | null }>();
  if (profile && !profile.deleted_at) redirect("/mood");

  return (
    <main className="mx-auto grid min-h-screen max-w-3xl items-center px-6 py-10">
      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-orange-100 backdrop-blur-xl">
        <p className="mb-3 text-sm font-bold text-pink-700">Welcome to eMoodition</p>
        <h1 className="text-3xl font-black tracking-tight">プロフィールを作成</h1>
        <p className="mt-3 leading-7 text-stone-700">友達にだけ表示される情報です。連絡先、外部ID、集合場所などは入れない運用です。</p>
        <div className="mt-5"><FormMessage message={params.message} /></div>

        <form action={createProfile} className="mt-6 space-y-5">
          <AvatarUploader name="avatarUrl" handleName="user" />
          <label className="block text-sm font-bold">ハンドルネーム<input className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-pink-400" name="handleName" maxLength={30} required placeholder="例：yuki" /></label>
          <label className="block text-sm font-bold">一言（15文字以下）<input className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-pink-400" name="tagline" maxLength={15} placeholder="例：今のノリ置いてる" /></label>

          <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-4 text-sm">
            <p className="font-bold">年齢区分</p>
            <p className="mt-1 text-xs leading-5 text-stone-500">20歳未満でも利用できます。20歳未満には、お酒に関する表示はカフェとして安全に表示されます。</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white bg-white/75 p-3"><input name="ageGroup" value="adult20" type="radio" className="mt-1" required /><span><span className="block font-bold">20歳以上</span><span className="text-xs text-stone-500">お酒表示が使えます</span></span></label>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white bg-white/75 p-3"><input name="ageGroup" value="under20" type="radio" className="mt-1" required /><span><span className="block font-bold">20歳未満</span><span className="text-xs text-stone-500">カフェ表示になります</span></span></label>
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4 text-sm">
            <input name="terms" type="checkbox" className="mt-1" required />
            <span><TransitionLink href="/terms" className="font-bold underline">利用規約</TransitionLink>・<TransitionLink href="/privacy" className="font-bold underline">プライバシーポリシー</TransitionLink>に同意します。</span>
          </label>
          <SubmitButton pendingText="作成中..." className="w-full rounded-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 px-5 py-3 font-black text-white shadow-lg shadow-pink-100">作成する</SubmitButton>
        </form>
      </section>
    </main>
  );
}
