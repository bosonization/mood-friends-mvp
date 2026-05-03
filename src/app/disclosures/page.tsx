import { AppFooter } from "@/components/AppFooter";
import { TransitionLink } from "@/components/TransitionLink";

export default function DisclosuresPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <TransitionLink href="/" className="mb-6 inline-flex rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-bold backdrop-blur">
        ← トップへ
      </TransitionLink>
      <article className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-orange-100 backdrop-blur-xl">
        <p className="text-sm font-bold text-pink-700">Ads / Affiliate</p>
        <h1 className="mt-2 text-3xl font-black">広告・アフィリエイト表記</h1>
        <section className="mt-8 space-y-6 text-sm leading-8 text-stone-700">
          <p>eMooditionでは、将来的に広告、PR、アフィリエイトリンクを掲載する場合があります。</p>
          <p>広告またはアフィリエイトである場合、利用者が広告であることを認識できるよう、掲載箇所付近に「広告」「PR」「アフィリエイト」等の表記を行います。</p>
          <p>広告リンクを通じて商品・サービスを購入した場合、運営者が成果報酬を受け取ることがあります。ただし、掲載内容は本サービスの利用体験を損なわない範囲に限定します。</p>
          <p>広告配信やアフィリエイト計測のため、外部サービスにCookie等の識別子や閲覧情報が送信される場合があります。導入時には、プライバシーポリシーに利用サービス名、送信情報、利用目的を追記します。</p>
        </section>
      </article>
      <AppFooter />
    </main>
  );
}
