export const MOODS = [
  {
    key: "food",
    icon: "🍚",
    label: "ごはん",
    description: "誰かとごはん行けるノリ"
  },
  {
    key: "drink",
    icon: "🍺",
    label: "飲み",
    description: "軽く飲みに行けるノリ"
  },
  {
    key: "movie",
    icon: "💬",
    label: "話す",
    description: "ちょっと話したいノリ"
  },
  {
    key: "game",
    icon: "🎮",
    label: "ゲーム",
    description: "一緒に遊べるノリ"
  },
  {
    key: "cafe",
    icon: "☕",
    label: "カフェ",
    description: "だらっと話せるノリ"
  },
  {
    key: "walk",
    icon: "🚶",
    label: "外出",
    description: "少し外に出たいノリ"
  },
  {
    key: "work",
    icon: "💻",
    label: "もくもく",
    description: "一緒に作業できるノリ"
  },
  {
    key: "travel",
    icon: "❤️",
    label: "何かしたい",
    description: "予定はないけど、何かしたいノリ"
  }
] as const;

export type Mood = (typeof MOODS)[number];
export type MoodKey = Mood["key"];

export function isMoodKey(value: string): value is MoodKey {
  return MOODS.some((mood) => mood.key === value);
}

export function getMood(key: string | null | undefined) {
  if (!key) return null;
  return MOODS.find((mood) => mood.key === key) ?? null;
}
