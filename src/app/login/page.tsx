import Link from "next/link";
import { signIn, signUp } from "./actions";
import { FormMessage } from "@/components/FormMessage";

type LoginPageProps = {
  searchParams: Promise<{
    message?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="mx-auto grid min-h-screen max-w-5xl items-center gap-8 px-6 py-10 md:grid-cols-[0.85fr_1.15fr]">
      <section>
        <Link href="/" className="mb-8 inline-flex rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-sm">
          ← トップへ
        </Link>
        <h1 className="text-4xl font-black tracking-tight">ログイン / 登録</h1>
        <p className="mt-4 leading-7 text-stone-700">
          開発中はSupabase側でメール確認をOFFにすると、登録後すぐにオンボーディングへ進めます。
        </p>
      </section>

      <section className="rounded-[2rem] border border-orange-100 bg-white/80 p-5 shadow-xl shadow-orange-100 backdrop-blur">
        <FormMessage message={params.message} />

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <form action={signIn} className="rounded-3xl border border-stone-100 bg-white p-5">
            <h2 className="text-xl font-bold">ログイン</h2>
            <input type="hidden" name="next" value={params.next ?? "/home"} />

            <label className="mt-5 block text-sm font-medium">
              メールアドレス
              <input
                className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-orange-400"
                name="email"
                type="email"
                required
                autoComplete="email"
              />
            </label>

            <label className="mt-4 block text-sm font-medium">
              パスワード
              <input
                className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-orange-400"
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="current-password"
              />
            </label>

            <button className="mt-5 w-full rounded-2xl bg-stone-950 px-5 py-3 font-bold text-white hover:bg-stone-800">
              ログイン
            </button>
          </form>

          <form action={signUp} className="rounded-3xl border border-orange-100 bg-orange-50/60 p-5">
            <h2 className="text-xl font-bold">新規登録</h2>

            <label className="mt-5 block text-sm font-medium">
              メールアドレス
              <input
                className="mt-2 w-full rounded-2xl border border-orange-200 px-4 py-3 outline-none focus:border-orange-400"
                name="email"
                type="email"
                required
                autoComplete="email"
              />
            </label>

            <label className="mt-4 block text-sm font-medium">
              パスワード
              <input
                className="mt-2 w-full rounded-2xl border border-orange-200 px-4 py-3 outline-none focus:border-orange-400"
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </label>

            <button className="mt-5 w-full rounded-2xl bg-orange-500 px-5 py-3 font-bold text-white hover:bg-orange-600">
              登録する
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
