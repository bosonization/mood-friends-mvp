const CONTACT_PATTERN =
  /(https?:\/\/|www\.|line\s?id|ライン|instagram|インスタ|twitter|x\.com|discord|電話|tel|@[a-zA-Z0-9_]{3,}|[0-9０-９]{3,}[-ー−\s]?[0-9０-９]{3,}[-ー−\s]?[0-9０-９]{3,})/i;

export function hasContactLikeText(value: string) {
  return CONTACT_PATTERN.test(value);
}

export function normalizeMemberCode(value: string) {
  return value.replace(/[^\d０-９]/g, "").replace(/[０-９]/g, (char) => {
    return String.fromCharCode(char.charCodeAt(0) - 0xfee0);
  });
}

export function formatRelativeTime(input: string | null | undefined) {
  if (!input) return "未更新";

  const date = new Date(input);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 1000 / 60));

  if (diffMinutes < 1) return "たった今";
  if (diffMinutes < 60) return `${diffMinutes}分前`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}時間前`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}日前`;

  return date.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}
