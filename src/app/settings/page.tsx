import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { withdraw } from "./actions";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export default async function SettingsPage() {
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

  if (!profile) redirect("/onboarding");

  return (
    <AppShell>
      <section className="mx-auto max-w-2xl space-y-5">
        <div className="rounded-[2rem] border border-orange-100 bg-white/85 p-5 shadow-sm">
          <p className="text-sm font-medium text-orange-700">Settings</p>
          <h1 className="text-2xl font-black">設定</h1>

          <div className="mt-5 rounded-3xl bg-stone-950 p-5 text-white">
            <p className="text-sm text-stone-300">会員コード</p>
            <p className="mt-2 font-mono text-3xl font-black tracking-widest">{profile.member_code}</p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-orange-100 bg-white/85 p-5 shadow-sm">
          <h2 className="text-xl font-black">利用規約 / プライバシーポリシー</h2>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            このMVPでは仮文言です。正式ローンチ前には、目的、禁止事項、通報、退会、個人情報の取り扱い、
            未成年/飲酒関連、外部連絡先の掲載禁止を明記してください。
          </p>
        </div>

        <div className="rounded-[2rem] border border-red-100 bg-white/85 p-5 shadow-sm">
          <h2 className="text-xl font-black text-red-700">退会</h2>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            MVPではプロフィールを退会済みに更新し、ログアウトします。Authユーザーの完全削除は管理者API実装が必要です。
          </p>
          <form action={withdraw} className="mt-5">
            <button className="rounded-2xl border border-red-200 px-5 py-3 font-bold text-red-700 hover:bg-red-50">
              退会する
            </button>
          </form>
        </div>
      </section>
    </AppShell>
  );
}
