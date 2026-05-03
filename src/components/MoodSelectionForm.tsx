"use client";

import { useState } from "react";
import type { MoodKey } from "@/lib/moods";
import { MOODS } from "@/lib/moods";
import { startMoodSession } from "@/app/mood/actions";

type MoodSelectionFormProps = {
  previousMoodKey?: string | null;
};

export function MoodSelectionForm({ previousMoodKey }: MoodSelectionFormProps) {
  const [selectedMoodKey, setSelectedMoodKey] = useState<MoodKey | "">("");

  const selectedMood = MOODS.find((mood) => mood.key === selectedMoodKey);

  return (
    <form action={startMoodSession} className="mt-7 space-y-6">
      <input type="hidden" name="moodKey" value={selectedMoodKey} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {MOODS.map((mood) => {
          const isSelected = mood.key === selectedMoodKey;
          const wasPrevious = mood.key === previousMoodKey;

          return (
            <button
              key={mood.key}
              type="button"
              onClick={() => setSelectedMoodKey(mood.key)}
              className={`rounded-[1.6rem] border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                isSelected
                  ? "border-fuchsia-300 bg-gradient-to-br from-white to-fuchsia-50 ring-4 ring-fuchsia-100"
                  : "border-orange-100 bg-white hover:border-pink-200"
              }`}
              aria-pressed={isSelected}
            >
              <span className="block text-4xl">{mood.icon}</span>
              <span className="mt-3 flex items-center gap-2 font-black">
                {mood.label}
                {wasPrevious ? (
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-500">
                    前回
                  </span>
                ) : null}
              </span>
              <span className="mt-1 block text-xs text-stone-500">{mood.description}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-[1.7rem] border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
        <p className="text-sm font-bold text-stone-700">
          {selectedMood ? `選択中: ${selectedMood.icon} ${selectedMood.label}` : "気分アイコンを1つ選択してください"}
        </p>
        <p className="mt-1 text-xs leading-5 text-stone-500">
          更新ボタンを押すと10分セッションを開始し、ホームへ移動します。セッション中は変更できません。
        </p>
        <button
          type="submit"
          disabled={!selectedMoodKey}
          className="mt-4 w-full rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 px-5 py-3 font-black text-white shadow-lg shadow-blue-200 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:scale-100"
        >
          更新してホームへ
        </button>
      </div>
    </form>
  );
}
