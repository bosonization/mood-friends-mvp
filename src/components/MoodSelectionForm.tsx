"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import type { MoodKey } from "@/lib/moods";
import { MOODS } from "@/lib/moods";
import { isMoodUnlocked, MOOD_UNLOCK_LEVEL, type UserLevel } from "@/lib/level";
import { startMoodSession } from "@/app/mood/actions";
import { SubmitButton } from "@/components/SubmitButton";

type MoodSelectionFormProps = {
  previousMoodKey?: string | null;
  level: UserLevel;
  isAdult: boolean;
};

function isDrinkMood(key: string) {
  return key === "drink";
}

export function MoodSelectionForm({ previousMoodKey, level, isAdult }: MoodSelectionFormProps) {
  const firstUnlocked = useMemo(() => {
    return MOODS.find((mood) => isMoodUnlocked(mood.key, level) && (isAdult || !isDrinkMood(mood.key)));
  }, [level, isAdult]);
  const [selectedMoodKey, setSelectedMoodKey] = useState<MoodKey | "">(firstUnlocked?.key ?? "");
  const [chillTapCount, setChillTapCount] = useState(0);
  const selectedMood = MOODS.find((mood) => mood.key === selectedMoodKey);
  const stealthUnlocked = selectedMoodKey === "cafe" && chillTapCount >= 5;

  function handleMoodTap(key: MoodKey, unlocked: boolean) {
    if (!unlocked) return;
    setSelectedMoodKey(key);
    if (key === "cafe") {
      setChillTapCount((count) => Math.min(5, count + 1));
    } else {
      setChillTapCount(0);
    }
  }

  return (
    <form action={startMoodSession} className="mt-7 space-y-6">
      <input type="hidden" name="moodKey" value={selectedMoodKey} />
      <input type="hidden" name="stealthMode" value={stealthUnlocked ? "on" : ""} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {MOODS.map((mood) => {
          const levelUnlocked = isMoodUnlocked(mood.key, level);
          const adultLocked = isDrinkMood(mood.key) && !isAdult;
          const unlocked = levelUnlocked && !adultLocked;
          const isSelected = mood.key === selectedMoodKey;
          const wasPrevious = mood.key === previousMoodKey;
          const unlockLevel = MOOD_UNLOCK_LEVEL[mood.key];

          return (
            <button
              key={mood.key}
              type="button"
              disabled={!unlocked}
              onClick={() => handleMoodTap(mood.key, unlocked)}
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
              <span className="mt-1 block text-xs text-stone-500">{mood.description}</span>
              {!levelUnlocked ? (
                <span className="mt-3 inline-flex rounded-full bg-stone-900 px-2 py-1 text-[10px] font-black text-white">
                  Lv{unlockLevel}で解放
                </span>
              ) : null}
              {adultLocked ? (
                <span className="mt-3 inline-flex rounded-full bg-stone-900 px-2 py-1 text-[10px] font-black text-white">
                  20歳以上で選べます
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <MoodSubmitArea selectedLabel={selectedMood ? `${selectedMood.icon} ${selectedMood.label}` : null} disabled={!selectedMoodKey} level={level} stealthUnlocked={stealthUnlocked} />
    </form>
  );
}

function MoodSubmitArea({ selectedLabel, disabled, level, stealthUnlocked }: { selectedLabel: string | null; disabled: boolean; level: UserLevel; stealthUnlocked: boolean }) {
  const { pending } = useFormStatus();

  return (
    <div className="rounded-[1.7rem] border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
      <p className="text-sm font-bold text-stone-700">{selectedLabel ? `選択中: ${selectedLabel}` : "今のノリを1つ選んでください"}</p>
      <p className="mt-1 text-xs leading-5 text-stone-500">
        今なにしてる？ではなく、今どんな誘いなら乗れそう？を置いておこう。現在Lv{level}です。
      </p>
      {stealthUnlocked ? (
        <p className="mt-3 rounded-2xl bg-stone-950 px-4 py-3 text-xs font-black text-white shadow-sm">
          Quiet pass unlocked
        </p>
      ) : null}
      <SubmitButton
        disabled={disabled || pending}
        pendingText={stealthUnlocked ? "入室中..." : "置いています..."}
        className={`mt-4 w-full rounded-2xl px-5 py-3 font-black text-white shadow-lg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:scale-100 ${
          stealthUnlocked
            ? "bg-gradient-to-r from-stone-900 via-slate-800 to-zinc-900 shadow-stone-200"
            : "bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 shadow-blue-200"
        }`}
      >
        {stealthUnlocked ? "このまま入る" : "今のノリを置く"}
      </SubmitButton>
    </div>
  );
}
