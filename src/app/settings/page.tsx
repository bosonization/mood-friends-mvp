import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { FormMessage } from "@/components/FormMessage";
import { SubmitButton } from "@/components/SubmitButton";
import { TransitionLink } from "@/components/TransitionLink";
import { updateDisplayMode, withdraw } from "./actions";
import { createClient } from "@/lib/supabase/server";
import { normalizeViewMode, VIEW_MODES } from "@/lib/viewMode";
import type { Profile } from "@/lib/types";

type SettingsPageProps = { searchParams: Promise<{ message?: string }> };

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>();
  if (!profile) redirect("/onboarding");

  const currentViewMode = normalizeViewMode(profile.display_mode);

  return (
    <AppShell>
      <section className="mx-auto max-w-2xl space-y-5">
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-xl">
          <p className="text-sm font-bold text-emerald-800">Settings</p>
          <h1 className="text-2xl font-black">設定</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">表示形式や規約、退会設定を管理できます。会員コードと招待は「友達」画面にまとめました。</p>
          <div className="mt-5"><FormMessage message={params.message} /></div>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-xl">
          <h2 className="text-xl font-black">友達の今の表示形式</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">トップ画面の「友達の今」を、Mood OrbitかListで表示できます。</p>
          <form action={updateDisplayMode} className="mt-5 space-y-3">
            {VIEW_MODES.map((mode) => (
              <label key={mode.key} className={`flex cursor-pointer items-start gap-3 rounded-[1.3rem] border p-4 transition ${currentViewMode === mode.key ? "border-fuchsia-200 bg-fuchsia-50/80 ring-4 ring-fuchsia-100" : "border-stone-100 bg-white hover:bg-emerald-50"}`}>
                <input type="radio" name="displayMode" value={mode.key} defaultChecked={currentViewMode === mode.key} className="mt-1" />
                <span><span className="block font-black">{mode.label}</span><span className="mt-1 block text-sm text-stone-500">{mode.description}</span></span>
              </label>
            ))}
            <SubmitButton pendingText="保存中..." className="w-full rounded-2xl bg-gradient-to-r from-[#063f2e] via-[#0b6b47] to-[#12915f] px-5 py-3 font-black text-white shadow-lg shadow-emerald-100">表示形式を保存</SubmitButton>
          </form>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-xl">
          <h2 className="text-xl font-black">規約・ポリシー</h2>
          <div className="mt-4 grid gap-3 text-sm font-bold text-stone-700">
            <TransitionLink href="/terms" className="rounded-2xl border border-stone-100 bg-white px-4 py-3 hover:bg-emerald-50">利用規約</TransitionLink>
            <TransitionLink href="/privacy" className="rounded-2xl border border-stone-100 bg-white px-4 py-3 hover:bg-emerald-50">プライバシーポリシー</TransitionLink>
            <TransitionLink href="/disclosures" className="rounded-2xl border border-stone-100 bg-white px-4 py-3 hover:bg-emerald-50">広告・アフィリエイト表記</TransitionLink>
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
