"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export const LOADING_EVENT = "emoodition:navigation-start";

export function startGlobalLoading() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(LOADING_EVENT));
  }
}

export function LoadingOverlay() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
  }, [pathname]);

  useEffect(() => {
    let timer: number | undefined;

    function handleStart() {
      window.clearTimeout(timer);
      setVisible(true);
      timer = window.setTimeout(() => setVisible(false), 3500);
    }

    window.addEventListener(LOADING_EVENT, handleStart);
    return () => {
      window.removeEventListener(LOADING_EVENT, handleStart);
      window.clearTimeout(timer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-stone-950/35 backdrop-blur-sm">
      <div className="rounded-[1.75rem] border border-white/20 bg-white/90 px-6 py-5 text-center shadow-2xl">
        <div className="mx-auto h-10 w-10 rounded-full border-4 border-stone-200 border-t-fuchsia-500 emoodition-spinner" />
        <p className="mt-3 text-sm font-black text-stone-800">更新中...</p>
      </div>
    </div>
  );
}
