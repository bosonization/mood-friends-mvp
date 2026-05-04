"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import type { MoodKey } from "@/lib/moods";
import { MOODS } from "@/lib/moods";
import { isMoodUnlocked, MOOD_UNLOCK_LEVEL, type UserLevel } from "@/lib/level";
import { startMoodSession } from "@/app/mood/actions";
import { SubmitButton } from "@/components/SubmitButton";

type MoodSelectionFormProps = {
  previousMoodKey?: string | null;
  level: UserLevel;
};

export function MoodSelectionForm({ previousMoodKey, level }: MoodSelectionFormProps) {
  const firstUnlocked = MOODS.find((mood) => isMoodUnlocked(mood.key, level));
  const [selectedMoodKey, setSelectedMoodKey] = useState<MoodKey | "">(firstUnlocked?.key ?? "");
  const selectedMood = MOODS.find((mood) => mood.key === selectedMoodKey);

  return (
    <form action={startMoodSession} className="mt-7 space-y-6">
      <input type="hidden" name="moodKey" value={selectedMoodKey} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {MOODS.map((mood) => {
          const unlocked = isMoodUnlocked(mood.key, level);
          const isSelected = mood.key === selectedMoodKey;
          const wasPrevious = mood.key === previousMoodKey;
          const unlockLevel = MOOD_UNLOCK_LEVEL[mood.key];

          return (
            <button
              key={mood.key}
              type="button"
              disabled={!unlocked}
              onClick={() => unlocked && setSelectedMoodKey(mood.key)}
              className={`relative rounded-[1.6rem] border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:hover:translate-y-0 ${
                isSelected
                  ? "border-fuchsia-300 bg-gradient-to-br from-white to-fuchsia-50 ring-4 ring-fuchsia-100"
                  : unlocked
                    ? "border-orange-100 bg-white hover:border-pink-200"
                    : "border-stone-100 bg-stone-50/80 opacity-55"
              }`}
              aria-pressed={isSelected}
            >
              <span className="block text-4xl">{mood.icon}</span>
              <span className="mt-3 flex items-center gap-2 font-black">
                {mood.label}
                {wasPrevious ? <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-500">前回</span> : null}
              </span>
              <span className="mt-1 block text-xs leading-5 text-stone-500">{mood.description}</span>
              {!unlocked ? (
                <span className="mt-3 inline-flex rounded-full bg-stone-900 px-2 py-1 text-[10px] font-black text-white">
                  Lv{unlockLevel}で解放
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <MoodSubmitArea selectedLabel={selectedMood ? `${selectedMood.icon} ${selectedMood.label}` : null} disabled={!selectedMoodKey} level={level} />
    </form>
  );
}

function MoodSubmitArea({ selectedLabel, disabled, level }: { selectedLabel: string | null; disabled: boolean; level: UserLevel }) {
  const { pending } = useFormStatus();

  return (
    <div className="rounded-[1.7rem] border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
      <p className="text-sm font-bold text-stone-700">{selectedLabel ? `選択中: ${selectedLabel}` : "今のノリを1つ選択してください"}</p>
      <p className="mt-1 text-xs leading-5 text-stone-500">
        現在Lv{level}です。レベルが上がると選べるノリが増えます。
      </p>
      <SubmitButton
        disabled={disabled || pending}
        pendingText="置いています..."
        className="mt-4 w-full rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 px-5 py-3 font-black text-white shadow-lg shadow-blue-200 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:scale-100"
      >
        今のノリを置く
      </SubmitButton>
    </div>
  );
}
