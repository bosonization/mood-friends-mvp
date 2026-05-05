# NoriDrop MVP

友達だけに「10分セッション単位の気分」と「その時のログイン」を共有する、チャットなしのMVPです。

## 今回の更新

- 画面遷移/更新ボタンにローディング表示を追加
- 気分更新は「アイコン選択 → 更新してホームへ」方式
- 「友達の今」から「最後に登録された気分」の補記を削除
- 友達の気分を時間で強調
  - 1時間以内: 赤
  - 6時間以内: 緑
- 気分アイコン変更
  - 映画 → 会話 / 💬 / 話したい
  - 旅行 → ウキウキ / ❤️ / テンション高い
- ホーム画面は「友達の今」を上、自分の情報を下に再配置
- 設定画面から登録ユーザー一覧に関する記載を削除

## 反映手順

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

確認後、GitHub/Vercelへ反映します。

```bash
git add .
git commit -m "Improve loading and home layout"
git push
```

## Supabase SQL

今回の更新でDB構造変更はありません。SQL実行は不要です。
既存環境でStorage未設定の場合のみ、過去の `supabase/update-20260503-noridrop.sql` を実行してください。
