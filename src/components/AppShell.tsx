import Link from "next/link";
import { signOut } from "@/app/login/actions";

type AppShellProps = { children: React.ReactNode };

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-5 sm:px-6">
      <header className="mb-6 flex items-center justify-between rounded-[1.75rem] border border-white/70 bg-white/75 px-4 py-3 shadow-sm backdrop-blur-xl">
        <Link href="/home" className="flex items-center gap-2 font-black tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-orange-400 via-pink-500 to-violet-600 text-white shadow-md">e</span>
          <span>eMoodition</span>
        </Link>

        <nav className="hidden gap-2 text-sm sm:flex">
          <Link className="rounded-full px-3 py-2 hover:bg-orange-50" href="/home">ホーム</Link>
          <Link className="rounded-full px-3 py-2 hover:bg-orange-50" href="/friends">友達</Link>
          <Link className="rounded-full px-3 py-2 hover:bg-orange-50" href="/profile">プロフィール</Link>
          <Link className="rounded-full px-3 py-2 hover:bg-orange-50" href="/settings">設定</Link>
        </nav>

        <form action={signOut}>
          <button className="rounded-full border border-orange-200 bg-white/70 px-3 py-2 text-sm hover:bg-orange-50">
            ログアウト
          </button>
        </form>
      </header>

      <main className="flex-1">{children}</main>

      <nav className="sticky bottom-4 mt-6 grid grid-cols-4 rounded-3xl border border-white/70 bg-white/90 p-2 text-center text-xs shadow-lg backdrop-blur-xl sm:hidden">
        <Link className="rounded-2xl px-2 py-3 hover:bg-orange-50" href="/home">ホーム</Link>
        <Link className="rounded-2xl px-2 py-3 hover:bg-orange-50" href="/friends">友達</Link>
        <Link className="rounded-2xl px-2 py-3 hover:bg-orange-50" href="/profile">プロフ</Link>
        <Link className="rounded-2xl px-2 py-3 hover:bg-orange-50" href="/settings">設定</Link>
      </nav>
    </div>
  );
}
