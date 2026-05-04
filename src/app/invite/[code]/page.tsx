import { redirect } from "next/navigation";
import { AppFooter } from "@/components/AppFooter";
import { CopyButton } from "@/components/CopyButton";
import { TransitionLink } from "@/components/TransitionLink";
import { createClient } from "@/lib/supabase/server";

function normalizeCode(code: string) {
  return code.replace(/[^0-9]/g, "").slice(0, 10);
}

type InvitePageProps = { params: Promise<{ code: string }> };

export default async function InvitePage({ params }: InvitePageProps) {
  const { code } = await params;
  const inviteCode = normalizeCode(code);
  if (inviteCode.length !== 10) redirect("/");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-10">
      <section className="grid flex-1 items-center">
        <div className="rounded-[2.2rem] border border-white/70 bg-white/85 p-6 shadow-2xl shadow-orange-100 backdrop-blur-xl">
          <p className="text-sm font-black text-pink-700">Invitation</p>
          <h1 className="mt-2 text-4xl font-black leading-tight tracking-tight sm:text-5xl">eMooditionに招待されています</h1>
          <p className="mt-4 max-w-2xl leading-8 text-stone-700">eMooditionは、友達だけに今の気分をそっと共有するアプリです。登録後、この招待コードが記録され、招待した友達のLv5解放条件に反映されます。</p>
          <div className="mt-6 rounded-[1.7rem] bg-stone-950 p-5 text-white"><p className="text-sm text-stone-300">招待コード</p><div className="mt-2 flex flex-wrap items-center gap-3"><p className="font-mono text-4xl font-black tracking-widest">{inviteCode}</p><CopyButton value={inviteCode} /></div></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {user ? <TransitionLink href="/friends" className="rounded-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 px-5 py-4 text-center font-black text-white shadow-lg shadow-pink-100">友達申請へ進む</TransitionLink> : <TransitionLink href={`/login?invite=${inviteCode}`} className="rounded-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 px-5 py-4 text-center font-black text-white shadow-lg shadow-pink-100">登録・ログインする</TransitionLink>}
            <TransitionLink href="/" className="rounded-2xl border border-stone-200 bg-white px-5 py-4 text-center font-black text-stone-800 shadow-sm">トップを見る</TransitionLink>
          </div>
          <p className="mt-5 text-xs leading-6 text-stone-500">登録後、友達ページでこの10桁コードを入力すると申請できます。</p>
        </div>
      </section>
      <AppFooter />
    </main>
  );
}
