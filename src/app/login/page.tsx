import { TransitionLink } from "@/components/TransitionLink";
import { SubmitButton } from "@/components/SubmitButton";
import { signIn, signUp } from "./actions";
import { FormMessage } from "@/components/FormMessage";

type LoginPageProps = { searchParams: Promise<{ message?: string; next?: string; invite?: string }> };

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const inviteCode = params.invite ?? "";

  return (
    <main className="grid min-h-screen items-center px-6 py-10">
      <section className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="flex flex-col justify-center">
          <TransitionLink href="/" className="mb-8 inline-flex w-fit rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-bold backdrop-blur">← トップへ</TransitionLink>
          <h1 className="text-5xl font-black leading-tight tracking-tight">eMooditionに<span className="block bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 bg-clip-text text-transparent">入る。</span></h1>
          <p className="mt-5 max-w-md leading-8 text-stone-700">ログイン後、10分セッションの最初に気分を選択します。友達が増えるとレベルが上がり、選べる気分が増えます。</p>
          {inviteCode ? <p className="mt-4 w-fit rounded-2xl bg-white/75 px-4 py-3 text-sm font-black text-pink-700 shadow-sm">招待コード: {inviteCode}</p> : null}
        </div>

        <section className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-xl shadow-orange-100 backdrop-blur-xl">
          <FormMessage message={params.message} />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <form action={signIn} className="rounded-3xl border border-stone-100 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black">ログイン</h2>
              <input type="hidden" name="next" value={params.next ?? "/mood"} />
              <label className="mt-5 block text-sm font-bold">メールアドレス<input className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-pink-400" name="email" type="email" required autoComplete="email" /></label>
              <label className="mt-4 block text-sm font-bold">パスワード<input className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-pink-400" name="password" type="password" required minLength={6} autoComplete="current-password" /></label>
              <SubmitButton pendingText="ログイン中..." className="mt-5 w-full rounded-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 px-5 py-3 font-black text-white shadow-lg shadow-pink-100">ログイン</SubmitButton>
            </form>

            <form action={signUp} className="rounded-3xl border border-orange-100 bg-orange-50/70 p-5 shadow-sm">
              <h2 className="text-xl font-black">新規登録</h2>
              <input type="hidden" name="inviteCode" value={inviteCode} />
              <label className="mt-5 block text-sm font-bold">メールアドレス<input className="mt-2 w-full rounded-2xl border border-orange-200 px-4 py-3 outline-none focus:border-pink-400" name="email" type="email" required autoComplete="email" /></label>
              <label className="mt-4 block text-sm font-bold">パスワード<input className="mt-2 w-full rounded-2xl border border-orange-200 px-4 py-3 outline-none focus:border-pink-400" name="password" type="password" required minLength={6} autoComplete="new-password" /></label>
              <label className="mt-4 block text-sm font-bold">パスワード確認<input className="mt-2 w-full rounded-2xl border border-orange-200 px-4 py-3 outline-none focus:border-pink-400" name="passwordConfirm" type="password" required minLength={6} autoComplete="new-password" /></label>
              <SubmitButton pendingText="登録中..." className="mt-5 w-full rounded-2xl bg-stone-950 px-5 py-3 font-black text-white hover:bg-stone-800">登録する</SubmitButton>
            </form>
          </div>
        </section>
      </section>
    </main>
  );
}
