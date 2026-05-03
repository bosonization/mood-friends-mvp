import { AppFooter } from "@/components/AppFooter";
import { TransitionLink } from "@/components/TransitionLink";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <TransitionLink href="/" className="mb-6 inline-flex rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-bold backdrop-blur">
        ← トップへ
      </TransitionLink>
      <article className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-orange-100 backdrop-blur-xl">
        <p className="text-sm font-bold text-pink-700">Privacy</p>
        <h1 className="mt-2 text-3xl font-black">eMoodition プライバシーポリシー</h1>
        <p className="mt-3 text-sm text-stone-500">最終更新日：2026年5月3日</p>

        <section className="mt-8 space-y-6 text-sm leading-8 text-stone-700">
          <div>
            <h2 className="text-lg font-black text-stone-900">1. 取得する情報</h2>
            <p>本サービスは、メールアドレス、ハンドルネーム、一言、プロフィール画像、会員コード、友達関係、気分、ログイン・更新日時、退会状態、通報・ブロック情報、アクセスに関する技術情報を取得することがあります。</p>
          </div>

          <div>
            <h2 className="text-lg font-black text-stone-900">2. 利用目的</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>アカウント登録、ログイン、本人確認のため</li>
              <li>友達承認済みの相手に気分・プロフィールを表示するため</li>
              <li>不正利用、攻撃、規約違反を防止するため</li>
              <li>本サービスの保守、改善、障害対応のため</li>
              <li>広告、アフィリエイト、利用状況分析を将来実施するため</li>
              <li>法令または規約に基づく対応のため</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-black text-stone-900">3. 共有範囲</h2>
            <p>利用者のハンドルネーム、一言、プロフィール画像、気分、最終登録日時等は、原則として友達承認済みの利用者に表示されます。メールアドレスは他の利用者には表示しません。</p>
          </div>

          <div>
            <h2 className="text-lg font-black text-stone-900">4. 外部サービスの利用</h2>
            <p>本サービスは、認証、データ保存、画像保存、ホスティング等のため、Supabase、Vercel等の外部サービスを利用します。将来、広告・アフィリエイト・アクセス解析を導入する場合、広告配信事業者やアフィリエイト事業者に対し、Cookie等の識別子、閲覧情報、広告表示情報が送信されることがあります。</p>
          </div>

          <div>
            <h2 className="text-lg font-black text-stone-900">5. 安全管理</h2>
            <p>運営者は、アクセス制限、行レベルセキュリティ、アップロードサイズ制限、レート制限等、合理的な範囲で安全管理措置を講じます。ただし、完全な安全性を保証するものではありません。</p>
          </div>

          <div>
            <h2 className="text-lg font-black text-stone-900">6. 保存期間</h2>
            <p>本サービスの提供に必要な期間、情報を保存します。退会後も、不正利用防止、紛争対応、法令対応、バックアップ等のため、一定期間情報が残ることがあります。</p>
          </div>

          <div>
            <h2 className="text-lg font-black text-stone-900">7. 問い合わせ</h2>
            <p>本サービスは個人開発のMVPであり、現時点で個別の問い合わせ窓口は設けていません。法令上対応が必要となる事項については、本サービス内での告知その他合理的な方法により対応する場合があります。</p>
          </div>

          <div>
            <h2 className="text-lg font-black text-stone-900">8. 変更</h2>
            <p>運営者は、本ポリシーを必要に応じて変更できます。変更後の内容は、本サービス内に掲載した時点から効力を生じます。</p>
          </div>
        </section>
      </article>
      <AppFooter />
    </main>
  );
}
