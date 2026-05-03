import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Avatar } from "@/components/Avatar";
import { AvatarUploader } from "@/components/AvatarUploader";
import { CopyButton } from "@/components/CopyButton";
import { FormMessage } from "@/components/FormMessage";
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
        <p className="text-sm font-bold text-pink-700">Profile</p>
        <h1 className="text-2xl font-black">プロフィール編集</h1>
        <div className="mt-5 flex items-center gap-4 rounded-3xl bg-orange-50 p-4">
          <Avatar src={profile.avatar_url} name={profile.handle_name} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="font-bold">{profile.handle_name}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2"><p className="font-mono text-sm tracking-widest text-stone-500">{profile.member_code}</p><CopyButton value={profile.member_code} /></div>
          </div>
        </div>
        <div className="mt-5"><FormMessage message={params.message} /></div>

        <form action={updateProfile} className="mt-6 space-y-5">
          <AvatarUploader name="avatarUrl" currentUrl={profile.avatar_url} handleName={profile.handle_name} />
          <label className="block text-sm font-bold">ハンドルネーム
            <input className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-pink-400" name="handleName" maxLength={30} required defaultValue={profile.handle_name} />
          </label>
          <label className="block text-sm font-bold">一言（15文字以下）
            <input className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-pink-400" name="tagline" maxLength={15} defaultValue={profile.tagline} />
          </label>
          <label className="flex items-start gap-3 rounded-2xl border border-orange-100 bg-orange-50/70 p-4 text-sm"><input name="isAdult" type="checkbox" className="mt-1" defaultChecked={profile.is_adult} /><span>20歳以上です</span></label>
          <button className="w-full rounded-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 px-5 py-3 font-black text-white shadow-lg shadow-pink-100">更新する</button>
        </form>
      </section>
    </AppShell>
  );
}
