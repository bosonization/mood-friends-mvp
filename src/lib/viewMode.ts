export const VIEW_MODES = [
  {
    key: "orbit",
    label: "Mood Orbit",
    description: "友達の気分をバブルで眺める表示"
  },
  {
    key: "list",
    label: "List",
    description: "友達の気分をカード一覧で読む表示"
  }
] as const;

export type ViewMode = (typeof VIEW_MODES)[number]["key"];

export function normalizeViewMode(value: string | null | undefined): ViewMode {
  return value === "list" ? "list" : "orbit";
}
