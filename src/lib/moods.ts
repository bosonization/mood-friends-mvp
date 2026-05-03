export const MOODS = [
  { key: "food", label: "食事", icon: "🍚", description: "ごはん行きたい" },
  { key: "drink", label: "お酒", icon: "🍺", description: "軽く飲みたい" },
  { key: "travel", label: "旅行", icon: "🧳", description: "どこか行きたい" },
  { key: "game", label: "ゲーム", icon: "🎮", description: "一緒に遊びたい" },
  { key: "cafe", label: "カフェ", icon: "☕", description: "少し話したい" },
  { key: "walk", label: "散歩", icon: "🚶", description: "外に出たい" },
  { key: "movie", label: "映画", icon: "🎬", description: "何か観たい" },
  { key: "work", label: "作業", icon: "💻", description: "ゆるく作業したい" }
] as const;

export type MoodKey = (typeof MOODS)[number]["key"];

export function getMood(key: string | null | undefined) {
  return MOODS.find((mood) => mood.key === key) ?? null;
}
