import { TransitionLink } from "@/components/TransitionLink";
import { SubmitButton } from "@/components/SubmitButton";
import { signIn, signUp } from "./actions";
import { FormMessage } from "@/components/FormMessage";

type LoginPageProps = { searchParams: Promise<{ message?: string; next?: string; invite?: string }> };

function normalizeToken(value: string | undefined) {
  return (value ?? "").replace(/[^0-9a-f]/gi, "").toLowerCase().slice(0, 32);
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const inviteToken = normalizeToken(params.invite);
  const hasInvite = inviteToken.length === 32;

  return (
    <main className="grid min-h-screen items-center px-6 py-10">
      <section className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="flex flex-col justify-center">
          <TransitionLink href="/" className="mb-8 inline-flex w-fit rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-bold backdrop-blur">← トップへ</TransitionLink>
          <h1 className="text-5xl font-black leading-tight tracking-tight">NoriDropに<span className="block bg-gradient-to-r from-[#063f2e] via-[#0b6b47] to-[#12915f] bg-clip-text text-transparent">入る。</span></h1>
          <p className="mt-5 max-w-md leading-8 text-stone-700">ログイン後、今のノリを選択します。ノリを置いて、友達の今どんなノリ？を見にいきましょう。</p>
          {hasInvite ? <p className="mt-4 w-fit rounded-2xl bg-white/75 px-4 py-3 text-sm font-black text-emerald-700 shadow-sm">24時間招待リンクから登録中</p> : null}
        </div>

        <section className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-xl shadow-emerald-100 backdrop-blur-xl">
          <FormMessage message={params.message} />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <form action={signIn} className="rounded-3xl border border-stone-100 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black">ログイン</h2>
              <input type="hidden" name="next" value={params.next ?? "/mood"} />
              <label className="mt-5 block text-sm font-bold">メールアドレス<input className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-emerald-500" name="email" type="email" required autoComplete="email" /></label>
              <label className="mt-4 block text-sm font-bold">パスワード<input className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-emerald-500" name="password" type="password" required minLength={6} autoComplete="current-password" /></label>
              <SubmitButton pendingText="ログイン中..." className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[#063f2e] via-[#0b6b47] to-[#12915f] px-5 py-3 font-black text-white shadow-lg shadow-emerald-100 transition hover:scale-[1.01]">ログイン</SubmitButton>
            </form>

            <form action={signUp} className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5 shadow-sm">
              <h2 className="text-xl font-black">新規登録</h2>
              <input type="hidden" name="inviteToken" value={inviteToken} />
              <label className="mt-5 block text-sm font-bold">メールアドレス<input className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 outline-none focus:border-emerald-500" name="email" type="email" required autoComplete="email" /></label>
              <label className="mt-4 block text-sm font-bold">パスワード<input className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 outline-none focus:border-emerald-500" name="password" type="password" required minLength={6} autoComplete="new-password" /></label>
              <label className="mt-4 block text-sm font-bold">パスワード確認<input className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 outline-none focus:border-emerald-500" name="passwordConfirm" type="password" required minLength={6} autoComplete="new-password" /></label>
              <SubmitButton pendingText="登録中..." className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[#063f2e] via-[#0b6b47] to-[#12915f] px-5 py-3 font-black text-white shadow-lg shadow-emerald-100 transition hover:scale-[1.01]">登録する</SubmitButton>
            </form>
          </div>
        </section>
      </section>
    </main>
  );
}
