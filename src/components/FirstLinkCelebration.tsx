"use client";

import { useEffect, useState } from "react";

type FirstLinkCelebrationProps = {
  friendCount: number;
  level: number;
};

const STORAGE_KEY = "noridrop:first-link-celebrated";

export function FirstLinkCelebration({ friendCount, level }: FirstLinkCelebrationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (friendCount < 1) return;
    if (window.localStorage.getItem(STORAGE_KEY) === "1") return;
    setVisible(true);
  }, [friendCount]);

  function close() {
    window.localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-stone-950/35 px-5 backdrop-blur-sm">
      <div className="relative max-w-md overflow-hidden rounded-[2rem] border border-white/70 bg-white p-6 text-center shadow-2xl shadow-emerald-200">
        <div className="absolute -left-10 -top-10 h-28 w-28 rounded-full bg-pink-200/60 blur-2xl" />
        <div className="absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-cyan-200/70 blur-2xl" />
        <div className="relative">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-to-r from-[#063f2e] via-[#0b6b47] to-[#12915f] text-5xl text-white shadow-xl shadow-emerald-100">✨</div>
          <p className="mt-5 text-sm font-black uppercase tracking-[0.22em] text-emerald-800">First Link!</p>
          <h2 className="mt-2 text-3xl font-black">最初の友達とつながりました</h2>
          <p className="mt-3 leading-7 text-stone-600">
            ここからNoriDropが一気に楽しくなります。友達のノリを見て、声をかけるきっかけにしましょう。
          </p>
          <div className="mt-5 rounded-[1.4rem] bg-stone-950 p-4 text-white">
            <p className="text-xs text-stone-400">現在のレベル</p>
            <p className="mt-1 text-2xl font-black">Lv{level}</p>
          </div>
          <button type="button" onClick={close} className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[#063f2e] via-[#0b6b47] to-[#12915f] px-5 py-3 font-black text-white shadow-lg shadow-emerald-100">はじめる</button>
          <button type="button" onClick={close} className="mt-3 text-xs font-bold text-stone-400 underline decoration-dotted underline-offset-4">閉じる</button>
        </div>
      </div>
    </div>
  );
}
