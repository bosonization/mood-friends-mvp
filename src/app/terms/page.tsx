import { AppFooter } from "@/components/AppFooter";
import { TransitionLink } from "@/components/TransitionLink";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <TransitionLink href="/" className="mb-6 inline-flex rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-bold backdrop-blur">
        ← トップへ
      </TransitionLink>
      <article className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-emerald-100 backdrop-blur-xl">
        <p className="text-sm font-bold text-emerald-800">Terms</p>
        <h1 className="mt-2 text-3xl font-black">NoriDrop 利用規約</h1>
        <p className="mt-3 text-sm text-stone-500">最終更新日：2026年5月3日</p>

        <section className="mt-8 space-y-6 text-sm leading-8 text-stone-700">
          <div>
            <h2 className="text-lg font-black text-stone-900">第1条（適用）</h2>
            <p>本利用規約は、NoriDrop運営者（以下「運営者」といいます。）が提供する「NoriDrop」（以下「本サービス」といいます。）の利用条件を定めるものです。利用者は、本規約に同意したうえで本サービスを利用するものとします。</p>
          </div>

          <div>
            <h2 className="text-lg font-black text-stone-900">第2条（サービス内容）</h2>
            <p>本サービスは、利用者が既に知っている友達に対し、10分セッション単位の気分、プロフィール、最終登録情報等を共有するサービスです。本サービスは、チャット、DM、出会い、交際、面識のない相手との連絡を目的とした機能を提供しません。</p>
          </div>

          <div>
            <h2 className="text-lg font-black text-stone-900">第3条（登録）</h2>
            <p>利用者は、正確な情報を用いて登録するものとします。運営者は、登録情報に虚偽、不正利用、規約違反があると判断した場合、アカウント停止、削除、利用制限を行うことがあります。</p>
          </div>

          <div>
            <h2 className="text-lg font-black text-stone-900">第4条（禁止事項）</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>電話番号、LINE ID、SNS ID、メールアドレス、住所、集合場所等の連絡先情報の掲載</li>
              <li>面識のない相手との出会い、交際、勧誘、斡旋を目的とする利用</li>
              <li>法令、公序良俗、本規約に違反する行為</li>
              <li>他人へのなりすまし、嫌がらせ、脅迫、差別的表現</li>
              <li>本サービスへの過度なアクセス、スクレイピング、攻撃、不正アクセス</li>
              <li>広告、宣伝、アフィリエイトリンク、外部誘導を無断で投稿する行為</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-black text-stone-900">第5条（利用停止・削除）</h2>
            <p>運営者は、利用者が本規約に違反した場合、事前通知なく投稿、プロフィール、アカウント、友達関係その他のデータを削除し、または本サービスの利用を制限できます。</p>
          </div>

          <div>
            <h2 className="text-lg font-black text-stone-900">第6条（広告・アフィリエイト）</h2>
            <p>運営者は、本サービス内に広告、PR、アフィリエイトリンクを掲載することがあります。広告またはアフィリエイトである場合は、利用者が認識できるよう「広告」「PR」等の表示を行います。</p>
          </div>

          <div>
            <h2 className="text-lg font-black text-stone-900">第7条（サービスの変更・停止）</h2>
            <p>運営者は、保守、障害、外部サービスの制限、無料枠の上限到達、攻撃、不正利用、その他必要がある場合、事前通知なく本サービスの全部または一部を変更、停止、中断、終了できます。</p>
          </div>

          <div>
            <h2 className="text-lg font-black text-stone-900">第8条（免責）</h2>
            <p>本サービスは現状有姿で提供されます。運営者は、本サービスの正確性、継続性、有用性、安全性、特定目的適合性を保証しません。運営者は、利用者間または第三者との間で生じたトラブル、損害、紛争について、法令上認められる範囲で責任を負いません。</p>
          </div>

          <div>
            <h2 className="text-lg font-black text-stone-900">第9条（規約変更）</h2>
            <p>運営者は、必要に応じて本規約を変更できます。変更後の規約は、本サービス内に掲載した時点から効力を生じるものとします。</p>
          </div>

          <div>
            <h2 className="text-lg font-black text-stone-900">第10条（準拠法）</h2>
            <p>本規約は日本法に準拠します。</p>
          </div>
        </section>
      </article>
      <AppFooter />
    </main>
  );
}
