import { TransitionLink } from "@/components/TransitionLink";
import { SubmitButton } from "@/components/SubmitButton";
import { AppFooter } from "@/components/AppFooter";
import { EmotionDock } from "@/components/EmotionDock";
import { signOut } from "@/app/login/actions";

type AppShellProps = { children: React.ReactNode };

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-5 sm:px-6">
      <header className="mb-6 flex items-center justify-between rounded-[1.75rem] border border-white/70 bg-white/78 px-4 py-3 shadow-sm backdrop-blur-xl">
        <TransitionLink href="/home" className="flex min-w-0 items-center gap-3 font-black tracking-tight" aria-label="NoriDrop ホーム">
          <span className="block h-10 w-10 shrink-0 overflow-hidden rounded-[0.9rem]">
            <img src="/noridrop-icon.png" alt="" className="h-full w-full object-cover" />
          </span>
          <img src="/noridrop-logo.png" alt="NoriDrop" className="h-8 w-auto max-w-[150px] object-contain sm:max-w-[190px]" />
        </TransitionLink>

        <nav className="hidden gap-2 text-sm sm:flex">
          <TransitionLink className="rounded-full px-3 py-2 hover:bg-emerald-50" href="/home">ホーム</TransitionLink>
          <TransitionLink className="rounded-full px-3 py-2 hover:bg-emerald-50" href="/friends">友達</TransitionLink>
          <TransitionLink className="rounded-full px-3 py-2 hover:bg-emerald-50" href="/profile">プロフィール</TransitionLink>
          <TransitionLink className="rounded-full px-3 py-2 hover:bg-emerald-50" href="/settings">設定</TransitionLink>
        </nav>

        <form action={signOut}>
          <SubmitButton pendingText="ログアウト中..." className="rounded-full border border-emerald-200 bg-white/70 px-3 py-2 text-sm hover:bg-emerald-50">
            ログアウト
          </SubmitButton>
        </form>
      </header>

      <main className="flex-1">{children}</main>
      <AppFooter />
      <EmotionDock />
    </div>
  );
}
