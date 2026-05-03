"use client";

import { useState } from "react";

type CopyButtonProps = { value: string; label?: string };

export function CopyButton({ value, label = "コピー" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      alert("コピーできませんでした。手動で選択してください。");
    }
  }

  return <button type="button" onClick={handleCopy} className="rounded-full border border-white/70 bg-white/80 px-3 py-2 text-sm font-bold text-stone-800 shadow-sm hover:bg-white">{copied ? "コピー済み" : label}</button>;
}
