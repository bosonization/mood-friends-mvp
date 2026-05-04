# Age-safe mood display update

## What changed

- 20歳未満でもアプリを自然に使えるようにしました。
- 内部キー `drink` は既存DB互換のため残します。
- 表示時に年齢区分で安全変換します。

## Display rule

- 20歳以上の本人: `drink` = 🍺 お酒
- 20歳未満の本人: `drink` = ☕ カフェ
- 20歳以上の人が `drink` を選んだ場合、20歳未満の閲覧者には ☕ カフェ と表示
- 20歳未満の人が `drink` を選んだ場合、誰が見ても ☕ カフェ と表示

## DB

No SQL required. Existing `profiles.is_adult` is used.

## Copy updates

- Mood selection title: 「いま、どんなノリ？」
- Some mood labels were softened for teen-friendly wording.
