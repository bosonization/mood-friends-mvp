import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { CopyButton } from "@/components/CopyButton";
import { SubmitButton } from "@/components/SubmitButton";
import { TransitionLink } from "@/components/TransitionLink";
import { withdraw } from "./actions";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>();
  if (!profile) redirect("/onboarding");

  return (
    <AppShell>
      <section className="mx-auto max-w-2xl space-y-5">
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-xl">
          <p className="text-sm font-bold text-pink-700">Settings</p><h1 className="text-2xl font-black">設定</h1>
          <div className="mt-5 rounded-[1.7rem] bg-stone-950 p-5 text-white"><p className="text-sm text-stone-300">会員コード</p><div className="mt-2 flex flex-wrap items-center gap-3"><p className="font-mono text-3xl font-black tracking-widest">{profile.member_code}</p><CopyButton value={profile.member_code} /></div></div>
        </div>
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-xl">
          <h2 className="text-xl font-black">規約・ポリシー</h2>
          <div className="mt-4 grid gap-3 text-sm font-bold text-stone-700">
            <TransitionLink href="/terms" className="rounded-2xl border border-stone-100 bg-white px-4 py-3 hover:bg-orange-50">利用規約</TransitionLink>
            <TransitionLink href="/privacy" className="rounded-2xl border border-stone-100 bg-white px-4 py-3 hover:bg-orange-50">プライバシーポリシー</TransitionLink>
            <TransitionLink href="/disclosures" className="rounded-2xl border border-stone-100 bg-white px-4 py-3 hover:bg-orange-50">広告・アフィリエイト表記</TransitionLink>
          </div>
        </div>
        <div className="rounded-[2rem] border border-red-100 bg-white/85 p-5 shadow-sm backdrop-blur-xl">
          <h2 className="text-xl font-black text-red-700">退会</h2>
          <p className="mt-3 text-sm leading-7 text-stone-600">MVPではプロフィールを退会済みに更新し、ログアウトします。Authユーザーの完全削除は管理者API実装が必要です。</p>
          <form action={withdraw} className="mt-5"><SubmitButton pendingText="退会処理中..." className="rounded-2xl border border-red-200 px-5 py-3 font-bold text-red-700 hover:bg-red-50">退会する</SubmitButton></form>
        </div>
      </section>
    </AppShell>
  );
}
