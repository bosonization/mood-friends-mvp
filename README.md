# eMoodition MVP

友達だけに「10分セッション単位の気分」と「その時のログイン」を共有する、チャットなしのMVPです。

## 今回入れた主な変更

- アプリ名を `eMoodition` に変更
- 気分は10分セッション制
  - セッションが切れている場合、ログイン後に `/mood` で気分選択
  - セッション中は気分変更不可
  - ホーム画面から気分変更UIを削除
- 会員コードのコピーボタン追加
- Supabase Storageによるプロフィールアイコンアップロード追加
- ログイン前LPを刷新
- CTAボタン色を視認性のあるグラデーションに変更
- アプリアイコン用ファイルを `src/app/icon.png` / `public/app-icon.png` に配置

## 既存プロジェクトへ適用する場合

1. このZIPのファイルで既存プロジェクトを上書き
2. Supabase SQL Editorで `supabase/update-20260503-emoodition.sql` を実行
3. ローカル確認

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

4. GitHubへ反映

```bash
git add .
git commit -m "Add eMoodition mood sessions and avatar upload"
git push
```

Vercelはpush後に自動デプロイされます。

## Supabase Storage

`avatars` bucketをSQLで作成します。画像は最大2MB、png/jpeg/webp/gifを想定しています。

## 登録ユーザー一覧について

法務リスクを下げるため、全登録ユーザー一覧はデフォルトでは実装していません。
将来的に入れる場合も、専門家確認後に、オプトイン・非公開情報非表示・検索制限・通報/ブロック・年齢設計を入れてください。
