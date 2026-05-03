# Mood Friends MVP

友達だけに「ラストログイン」と「その時の気分」を共有する、チャットなしのMVP雛形です。

## 技術スタック

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth / Postgres / RLS
- Vercel

## 入っている機能

- メール/パスワードで会員登録・ログイン
- 利用規約同意
- 10桁の会員コード自動発行
- プロフィール作成/編集
  - ハンドルネーム
  - 一言15文字以内
  - アイコンURL
- トップページ
  - 初回は気分選択が必須
  - 友達の気分とラストログインを一覧表示
- 気分アイコン8種
  - 食事
  - お酒
  - 旅行
  - ゲーム
  - カフェ
  - 散歩
  - 映画
  - 作業
- 会員コードによる友達申請
- 友達承認/拒否
- 友達削除
- 退会
- アプリ内チャットなし

## セットアップ

### 1. 依存関係を入れる

```bash
npm install
```

### 2. Supabaseプロジェクトを作る

Supabaseで新規プロジェクトを作成します。

Auth設定では、開発中は次がおすすめです。

- Authentication > Sign In / Providers > Email を有効化
- Confirm email は開発中のみOFF推奨
- Site URL: `http://localhost:3000`
- Redirect URLs:
  - `http://localhost:3000/**`
  - Vercel公開後は `https://your-domain.vercel.app/**`

### 3. SQLを実行する

Supabase SQL Editorで、以下を実行してください。

```txt
supabase/schema.sql
```

### 4. 環境変数を入れる

```bash
cp .env.example .env.local
```

`.env.local` にSupabaseの値を入れます。

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### 5. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 を開きます。

## Vercel公開

1. GitHubにpush
2. VercelでImport Project
3. 環境変数を追加
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## 重要な安全設計メモ

このMVPは、次の制約で「友達の気分共有」に寄せています。

- 公開タイムラインなし
- ユーザー検索なし
- 会員コードによる申請のみ
- 相互承認後のみ表示
- アプリ内チャット/DMなし
- LINE ID、電話番号、URLなどを一言に入れにくくする簡易チェックあり

正式ローンチ前には、必ず弁護士または行政書士など専門家に確認してください。

## 今後追加するとよいもの

- Supabase Storageで画像アップロード
- 通報/ブロックUI
- 管理画面
- 利用規約/プライバシーポリシーの正式文面
- 年齢確認
- お酒アイコンの20歳以上制限
- 監査ログの可視化
- Rate Limit / Bot対策
- E2Eテスト
