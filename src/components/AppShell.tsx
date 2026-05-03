import Link from "next/link";
import { signOut } from "@/app/login/actions";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-5 sm:px-6">
      <header className="mb-6 flex items-center justify-between rounded-3xl border border-orange-100 bg-white/75 px-4 py-3 shadow-sm backdrop-blur">
        <Link href="/home" className="font-bold tracking-tight">
          Mood Friends
        </Link>

        <nav className="hidden gap-2 text-sm sm:flex">
          <Link className="rounded-full px-3 py-2 hover:bg-orange-50" href="/home">
            ホーム
          </Link>
          <Link className="rounded-full px-3 py-2 hover:bg-orange-50" href="/friends">
            友達
          </Link>
          <Link className="rounded-full px-3 py-2 hover:bg-orange-50" href="/profile">
            プロフィール
          </Link>
          <Link className="rounded-full px-3 py-2 hover:bg-orange-50" href="/settings">
            設定
          </Link>
        </nav>

        <form action={signOut}>
          <button className="rounded-full border border-orange-200 px-3 py-2 text-sm hover:bg-orange-50">
            ログアウト
          </button>
        </form>
      </header>

      <main className="flex-1">{children}</main>

      <nav className="sticky bottom-4 mt-6 grid grid-cols-4 rounded-3xl border border-orange-100 bg-white/90 p-2 text-center text-xs shadow-lg backdrop-blur sm:hidden">
        <Link className="rounded-2xl px-2 py-3 hover:bg-orange-50" href="/home">
          ホーム
        </Link>
        <Link className="rounded-2xl px-2 py-3 hover:bg-orange-50" href="/friends">
          友達
        </Link>
        <Link className="rounded-2xl px-2 py-3 hover:bg-orange-50" href="/profile">
          プロフ
        </Link>
        <Link className="rounded-2xl px-2 py-3 hover:bg-orange-50" href="/settings">
          設定
        </Link>
      </nav>
    </div>
  );
}
