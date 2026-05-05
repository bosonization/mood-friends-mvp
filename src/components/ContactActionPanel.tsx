"use client";

import { useMemo, useState } from "react";

type ContactActionPanelProps = {
  handleName: string;
  moodLabel?: string | null;
  moodIcon?: string | null;
  relativeTime?: string | null;
};

function buildMessage({ handleName, moodLabel, moodIcon, relativeTime }: ContactActionPanelProps) {
  const moodText = moodLabel ? `${moodIcon ?? ""} ${moodLabel}`.trim() : "今のノリ";
  const timeText = relativeTime ? `（${relativeTime}）` : "";
  return `NoriDropで${handleName}さんの「${moodText}」を見たよ${timeText}。今ちょっと話せる？`;
}

export function ContactActionPanel(props: ContactActionPanelProps) {
  const [copied, setCopied] = useState(false);
  const message = useMemo(() => buildMessage(props), [props]);
  const encodedMessage = encodeURIComponent(message);

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      alert("コピーできませんでした。手動で選択してください。");
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ text: message });
        return;
      } catch {
        // fall back to copy
      }
    }
    await copyMessage();
  }

  return (
    <div className="mt-3 rounded-[1.25rem] border border-white/70 bg-white/75 p-3 shadow-sm backdrop-blur-xl">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-black text-stone-500">連絡する</p>
        {copied ? <span className="rounded-full bg-stone-950 px-2 py-0.5 text-[10px] font-black text-white">コピー済み</span> : null}
      </div>

      <div className="grid grid-cols-4 gap-1.5 text-center text-[11px] font-black sm:grid-cols-4">
        <button type="button" onClick={handleShare} className="rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-500 px-2 py-2.5 text-white shadow-sm">共有</button>
        <a href={`https://line.me/R/share?text=${encodedMessage}`} target="_blank" rel="noreferrer" className="rounded-xl bg-[#06C755] px-2 py-2.5 text-white shadow-sm">LINE</a>
        <a href={`sms:?&body=${encodedMessage}`} className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-2 py-2.5 text-white shadow-sm">SMS</a>
        <button type="button" onClick={copyMessage} className="rounded-xl border border-stone-200 bg-white px-2 py-2.5 text-stone-800 shadow-sm">コピー</button>
      </div>
    </div>
  );
}
