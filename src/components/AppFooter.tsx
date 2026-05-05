import { TransitionLink } from "@/components/TransitionLink";

export function AppFooter() {
  return (
    <footer className="mt-10 border-t border-white/60 pt-6 text-xs leading-6 text-stone-500">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="font-bold text-stone-600">© NoriDrop</span>
        <TransitionLink href="/terms" className="hover:text-stone-900">利用規約</TransitionLink>
        <TransitionLink href="/privacy" className="hover:text-stone-900">プライバシーポリシー</TransitionLink>
        <TransitionLink href="/disclosures" className="hover:text-stone-900">広告・アフィリエイト表記</TransitionLink>
      </div>
      <p className="mt-2">NoriDropはチャット・DMを提供しない、友達限定のノリ共有サービスです。</p>
    </footer>
  );
}
