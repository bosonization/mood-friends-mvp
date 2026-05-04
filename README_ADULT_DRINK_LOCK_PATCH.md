# Adult drink lock patch

## Changes

- 20歳未満の場合、「飲み」を「カフェ」に自動置換しない。
- 20歳未満の場合、「飲み」は選択不可として表示する。
- 「カフェ」は全年齢で選べる独立したノリとして残す。
- サーバー側 `startMoodSession` でも、20歳未満の `drink` 保存を拒否する。
- `moods.ts` の8つのラベル・補足もノリ表現に統一。

## Supabase

No SQL required.
