export const MOODS = [
  { key: "food", label: "ごはん", icon: "🍚", description: "行ける" },
  { key: "drink", label: "お酒", icon: "🍺", description: "軽く飲みたい" },
  { key: "travel", label: "ウキウキ", icon: "❤️", description: "テンション高い" },
  { key: "game", label: "ゲーム", icon: "🎮", description: "一緒に遊びたい" },
  { key: "cafe", label: "チル", icon: "🫧", description: "ゆるくいたい" },
  { key: "walk", label: "外出たい", icon: "🚶", description: "外出たい" },
  { key: "movie", label: "話そ", icon: "💬", description: "話したい" },
  { key: "work", label: "もくもく", icon: "💻", description: "もくもくしたい" }
] as const;

export type MoodKey = (typeof MOODS)[number]["key"];
export type MoodPresentation = {
  key: MoodKey;
  label: string;
  icon: string;
  description: string;
};

export type MoodDisplayOptions = {
  /** The person who is looking at the mood. */
  viewerIsAdult?: boolean;
  /** The person who selected the mood. */
  ownerIsAdult?: boolean;
};

const SAFE_DRINK_MOOD: MoodPresentation = {
  key: "drink",
  label: "カフェ",
  icon: "☕",
  description: "話したい"
};

function normalizeOptions(options?: MoodDisplayOptions | boolean): Required<MoodDisplayOptions> {
  if (typeof options === "boolean") {
    return { viewerIsAdult: options, ownerIsAdult: options };
  }

  return {
    viewerIsAdult: options?.viewerIsAdult ?? true,
    ownerIsAdult: options?.ownerIsAdult ?? options?.viewerIsAdult ?? true
  };
}

/**
 * Age-safe mood presentation.
 *
 * Internal `drink` stays compatible with existing DB rows.
 * - Adult owner + adult viewer: 🍺 お酒
 * - Adult owner + under-20 viewer: ☕ カフェ
 * - Under-20 owner + any viewer: ☕ カフェ
 */
export function getMood(key: string | null | undefined, options?: MoodDisplayOptions | boolean): MoodPresentation | null {
  const mood = MOODS.find((item) => item.key === key) ?? null;
  if (!mood) return null;

  const { viewerIsAdult, ownerIsAdult } = normalizeOptions(options);

  if (mood.key === "drink" && (!viewerIsAdult || !ownerIsAdult)) {
    return SAFE_DRINK_MOOD;
  }

  return mood;
}

/** Mood options shown when the current user chooses their own mood. */
export function getSelectableMoods(isAdult: boolean): MoodPresentation[] {
  return MOODS.map((mood) => {
    if (mood.key === "drink" && !isAdult) return SAFE_DRINK_MOOD;
    return mood;
  });
}

export function isMoodKey(value: string): value is MoodKey {
  return MOODS.some((mood) => mood.key === value);
}
