"use client";

import { useEffect, useMemo, useState } from "react";

type ShareInviteButtonProps = {
  memberCode: string;
  handleName?: string | null;
  variant?: "compact" | "card";
};

function buildInvitePath(memberCode: string) {
  return `/invite/${memberCode}`;
}

export function ShareInviteButton({ memberCode, handleName, variant = "compact" }: ShareInviteButtonProps) {
  const [copied, setCopied] = useState(false);
  const [inviteUrl, setInviteUrl] = useState(buildInvitePath(memberCode));

  useEffect(() => {
    setInviteUrl(`${window.location.origin}${buildInvitePath(memberCode)}`);
  }, [memberCode]);

  const shareText = useMemo(() => {
    const from = handleName ? `${handleName}から` : "";
    return `${from}eMooditionの招待です。会員コード: ${memberCode}`;
  }, [handleName, memberCode]);

  async function copyInvite() {
    const text = `${shareText}\n${inviteUrl}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      alert("コピーできませんでした。会員コードを手動でコピーしてください。");
    }
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "eMooditionに招待", text: shareText, url: inviteUrl });
        return;
      } catch {
        return;
      }
    }
    await copyInvite();
  }

  const encodedUrl = encodeURIComponent(inviteUrl);
  const encodedText = encodeURIComponent(`${shareText}\n${inviteUrl}`);
  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`;
  const smsUrl = `sms:?&body=${encodedText}`;

  if (variant === "card") {
    return (
      <div className="rounded-[1.7rem] border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur-xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><p className="text-sm font-black text-pink-700">Invite</p><h3 className="mt-1 text-xl font-black">友達を招待</h3><p className="mt-2 text-sm leading-6 text-stone-600">URLとあなたの会員コードを一緒に共有します。LINE、SMS、Instagram DMなどはスマホの共有シートから送れます。</p></div>
          <div className="rounded-2xl bg-stone-950 px-4 py-3 text-white"><p className="text-[10px] font-black uppercase tracking-[0.22em] text-stone-400">Code</p><p className="font-mono text-lg font-black tracking-widest">{memberCode}</p></div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button type="button" onClick={nativeShare} className="rounded-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-pink-100">共有</button>
          <a href={lineUrl} target="_blank" rel="noreferrer" className="rounded-2xl bg-[#06C755] px-4 py-3 text-center text-sm font-black text-white shadow-sm">LINE</a>
          <a href={smsUrl} className="rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-3 text-center text-sm font-black text-white shadow-lg shadow-sky-100">SMS</a>
          <button type="button" onClick={copyInvite} className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-black text-stone-800 shadow-sm">{copied ? "コピー済み" : "コピー"}</button>
        </div>
        <p className="mt-3 text-xs leading-5 text-stone-500">InstagramはWebから本文を直接入れにくいため、共有ボタンまたはコピー後にDM/ストーリーへ貼り付けてください。</p>
      </div>
    );
  }

  return <button type="button" onClick={nativeShare} className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-2 text-sm font-black text-stone-800 shadow-sm hover:bg-white" aria-label="招待を共有"><span>↗</span><span>共有</span></button>;
}
