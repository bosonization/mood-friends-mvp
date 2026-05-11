"use client";

import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { tutorialSteps } from "@/lib/tutorial";
import { completeTutorial } from "@/app/home/tutorial-actions";

type NoriTutorialProps = {
  /** kept for compatibility with previous patches. This safe version intentionally does NOT auto-open. */
  forceOpen?: boolean;
  showLauncher?: boolean;
  level?: number;
};

export function NoriTutorial({ showLauncher = false, level }: NoriTutorialProps) {
  const canLaunch = showLauncher || (typeof level === "number" && level >= 3);
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPending, startTransition] = useTransition();

  // Safety: never auto-open the tutorial on mount.
  // The previous implementation could cover the home screen with chu01.
  useEffect(() => {
    setOpen(false);
  }, []);

  function openTutorial() {
    setStepIndex(0);
    setOpen(true);
  }

  function closeTutorial() {
    setOpen(false);
    setStepIndex(0);
  }

  function next() {
    const lastIndex = tutorialSteps.length - 1;
    if (stepIndex < lastIndex) {
      setStepIndex((current) => current + 1);
      return;
    }

    startTransition(async () => {
      try {
        await completeTutorial();
      } finally {
        closeTutorial();
      }
    });
  }

  const step = tutorialSteps[stepIndex];

  return (
    <>
      {canLaunch ? (
        <button
          type="button"
          onClick={openTutorial}
          className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-white/90 px-3 py-2 text-xs font-black text-emerald-900 shadow-sm backdrop-blur transition hover:bg-emerald-50"
          aria-label="NoriDropの使い方を見る"
        >
          <span aria-hidden="true">?</span>
          <span>使い方</span>
        </button>
      ) : null}

      {open ? (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-stone-950/55 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="NoriDropの使い方"
        >
          <div className="relative flex max-h-[92dvh] w-full max-w-[430px] flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <button
              type="button"
              onClick={closeTutorial}
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-lg font-black text-stone-700 shadow-sm backdrop-blur"
              aria-label="チュートリアルを閉じる"
            >
              ×
            </button>

            <div className="relative min-h-0 flex-1 bg-emerald-50/40">
              <Image
                src={step.image}
                alt={step.alt}
                width={941}
                height={1672}
                priority={stepIndex === 0}
                className="max-h-[74dvh] w-full object-contain"
                sizes="(max-width: 480px) 92vw, 430px"
              />
            </div>

            <div className="border-t border-emerald-50 bg-white px-5 py-4">
              <div className="flex items-center justify-center gap-1.5">
                {tutorialSteps.map((_, index) => (
                  <span
                    key={index}
                    className={`h-1.5 rounded-full transition-all ${index === stepIndex ? "w-7 bg-emerald-700" : "w-1.5 bg-emerald-100"}`}
                  />
                ))}
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={stepIndex === 0 ? closeTutorial : () => setStepIndex((current) => Math.max(0, current - 1))}
                  className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-black text-stone-700"
                >
                  {stepIndex === 0 ? "閉じる" : "戻る"}
                </button>
                <button
                  type="button"
                  onClick={next}
                  disabled={isPending}
                  className="min-w-0 flex-1 rounded-2xl bg-gradient-to-r from-[#053d2c] to-[#0a8f5c] px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-100 disabled:opacity-60"
                >
                  {isPending ? "保存中..." : stepIndex === tutorialSteps.length - 1 ? "はじめる" : "次へ"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
