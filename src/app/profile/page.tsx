import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { AvatarUploader } from "@/components/AvatarUploader";
import { FormMessage } from "@/components/FormMessage";
import { SubmitButton } from "@/components/SubmitButton";
import { updateProfile } from "./actions";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

type ProfilePageProps = { searchParams: Promise<{ message?: string }> };

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>();
  if (!profile) redirect("/onboarding");

  return (
    <AppShell>
      <section className="mx-auto max-w-2xl rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-xl">
        <p className="text-sm font-bold text-pink-700">Profile</p><h1 className="text-2xl font-black">プロフィール編集</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">画像、名前、一言、年齢区分を編集できます。</p>
        <div className="mt-5"><FormMessage message={params.message} /></div>
        <form action={updateProfile} className="mt-6 space-y-5">
          <AvatarUploader name="avatarUrl" currentUrl={profile.avatar_url} handleName={profile.handle_name} />
          <label className="block text-sm font-bold">ハンドルネーム<input className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-pink-400" name="handleName" maxLength={30} required defaultValue={profile.handle_name} /></label>
          <label className="block text-sm font-bold">一言（15文字以下）<input className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-pink-400" name="tagline" maxLength={15} defaultValue={profile.tagline} /></label>

          <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-4 text-sm">
            <p className="font-bold">年齢区分</p>
            <p className="mt-1 text-xs leading-5 text-stone-500">20歳未満の場合、「飲み」は選べません。</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white bg-white/75 p-3"><input name="ageGroup" value="adult20" type="radio" className="mt-1" defaultChecked={profile.is_adult} /><span><span className="block font-bold">20歳以上</span><span className="text-xs text-stone-500">「飲み」が選べます</span></span></label>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white bg-white/75 p-3"><input name="ageGroup" value="under20" type="radio" className="mt-1" defaultChecked={!profile.is_adult} /><span><span className="block font-bold">20歳未満</span><span className="text-xs text-stone-500">「飲み」は選べません</span></span></label>
            </div>
          </div>

          <SubmitButton pendingText="更新中..." className="w-full rounded-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 px-5 py-3 font-black text-white shadow-lg shadow-pink-100">更新する</SubmitButton>
        </form>
      </section>
    </AppShell>
  );
}
