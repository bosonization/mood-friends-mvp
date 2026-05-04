"use client";

import { useMemo, useState } from "react";

type ContactActionPanelProps = {
  handleName: string;
  moodLabel?: string | null;
  moodIcon?: string | null;
  relativeTime?: string | null;
};

function buildMessage({ handleName, moodLabel, moodIcon, relativeTime }: ContactActionPanelProps) {
  const moodText = moodLabel ? `${moodIcon ?? ""} ${moodLabel}`.trim() : "今の気分";
  const timeText = relativeTime ? `（${relativeTime}）` : "";
  return `eMooditionで${handleName}さんの「${moodText}」を見たよ${timeText}。今ちょっと話せる？`;
}

export function ContactActionPanel(props: ContactActionPanelProps) {
  const [copied, setCopied] = useState(false);
  const message = useMemo(() => buildMessage(props), [props]);
  const encodedMessage = encodeURIComponent(message);

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
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
        // User cancelled or the native share sheet failed. Fall back to copy.
      }
    }

    await copyMessage();
  }

  return (
    <div className="mt-4 rounded-[1.45rem] border border-white/70 bg-white/75 p-3 shadow-sm backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-400">External Contact</p>
          <h3 className="mt-1 text-sm font-black text-stone-900">外部で連絡する</h3>
        </div>
        {copied ? <span className="rounded-full bg-stone-950 px-2 py-1 text-[10px] font-black text-white">コピー済み</span> : null}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-center text-[12px] font-black">
        <button
          type="button"
          onClick={handleShare}
          className="rounded-2xl bg-gradient-to-r from-fuchsia-500 to-violet-500 px-3 py-3 text-white shadow-lg shadow-fuchsia-100 transition hover:scale-[1.02]"
        >
          共有
        </button>
        <a
          href={`https://line.me/R/share?text=${encodedMessage}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-2xl bg-[#06C755] px-3 py-3 text-white shadow-lg shadow-emerald-100 transition hover:scale-[1.02]"
        >
          LINE
        </a>
        <a
          href={`sms:?&body=${encodedMessage}`}
          className="rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 px-3 py-3 text-white shadow-lg shadow-sky-100 transition hover:scale-[1.02]"
        >
          SMS
        </a>
        <button
          type="button"
          onClick={copyMessage}
          className="rounded-2xl border border-stone-200 bg-white px-3 py-3 text-stone-800 shadow-sm transition hover:scale-[1.02] hover:bg-stone-50"
        >
          文面コピー
        </button>
      </div>

      <p className="mt-3 text-[10px] leading-5 text-stone-500">
        連絡は、すでに知っている相手に外部アプリで行ってください。eMooditionはチャット・DM・連絡先交換機能を提供していません。Instagramは「共有」から選べます。
      </p>
    </div>
  );
}
