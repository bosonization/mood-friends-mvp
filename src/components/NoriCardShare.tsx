"use client";

import { useMemo, useState } from "react";

export type NoriLikeSummary = {
  currentCount: number;
  currentNames: string[];
  previousCount: number;
  previousNames: string[];
  previousMoodIcon?: string | null;
  previousMoodLabel?: string | null;
};

type NoriCardShareProps = {
  memberCode: string;
  handleName: string;
  moodIcon: string;
  moodLabel: string;
  moodDescription: string;
  remainingTime?: string | null;
  spotlightActive?: boolean;
  likeSummary?: NoriLikeSummary;
};

type InvitePayload = {
  token: string;
  expiresAt: string;
  memberCode: string;
};

function formatExpiresAt(input: string) {
  try {
    return new Date(input).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "24時間以内";
  }
}

function getInviteUrl(token: string) {
  return `${window.location.origin}/invite/${token}`;
}

export function NoriCardShare({ memberCode, handleName, moodIcon, moodLabel, moodDescription, remainingTime, spotlightActive, likeSummary }: NoriCardShareProps) {
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [showLikes, setShowLikes] = useState(false);
  const currentLikeCount = likeSummary?.currentCount ?? 0;
  const previousLikeCount = likeSummary?.previousCount ?? 0;
  const totalLikeCount = currentLikeCount + previousLikeCount;

  const baseMessage = useMemo(() => {
    return `${handleName}さんがeMooditionで今このノリを置いています。\n\n${moodIcon} ${moodLabel}\n${moodDescription}\n\n一緒に使うと、友達の「今どんなノリ？」がわかります。`;
  }, [handleName, moodIcon, moodLabel, moodDescription]);

  async function ensureInvite() {
    if (inviteUrl && expiresAt) return { url: inviteUrl, expiresAt };

    setCreating(true);
    try {
      const response = await fetch("/api/invites/create", { method: "POST" });
      const payload = (await response.json()) as Partial<InvitePayload> & { error?: string };

      if (!response.ok || !payload.token || !payload.expiresAt) {
        throw new Error(payload.error || "invite_create_failed");
      }

      const url = getInviteUrl(payload.token);
      setInviteUrl(url);
      setExpiresAt(payload.expiresAt);
      return { url, expiresAt: payload.expiresAt };
    } finally {
      setCreating(false);
    }
  }

  async function shareNoriCard() {
    try {
      const invite = await ensureInvite();
      if (navigator.share) {
        await navigator.share({ title: "eMooditionのノリカード", text: baseMessage, url: invite.url });
        return;
      }
      await navigator.clipboard.writeText(`${baseMessage}\n${invite.url}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      alert("ノリカードを共有できませんでした。招待リンク用SQLが実行済みか確認してください。");
    }
  }

  async function copyNoriCard() {
    try {
      const invite = await ensureInvite();
      await navigator.clipboard.writeText(`${baseMessage}\n${invite.url}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      alert("ノリカードをコピーできませんでした。招待リンク用SQLが実行済みか確認してください。");
    }
  }

  async function toggleQr() {
    try {
      await ensureInvite();
      setShowQr((current) => !current);
    } catch {
      alert("QR招待を作成できませんでした。招待リンク用SQLが実行済みか確認してください。");
    }
  }

  const qrUrl = inviteUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&data=${encodeURIComponent(inviteUrl)}` : null;

  return (
    <section className="overflow-hidden rounded-[1.7rem] border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-orange-50 via-pink-50 to-white text-4xl shadow-sm shadow-orange-100">
            {moodIcon}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-pink-600">Nori Card</p>
              {remainingTime ? <span className="rounded-full bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 px-2.5 py-1 text-[10px] font-black text-white shadow-sm">変更まで {remainingTime}</span> : null}
              {totalLikeCount > 0 ? <button type="button" onClick={() => setShowLikes((current) => !current)} className="rounded-full bg-pink-50 px-2.5 py-1 text-[10px] font-black text-pink-700 shadow-sm">♡ 今{currentLikeCount} / 前{previousLikeCount}</button> : null}
              {spotlightActive ? <span className="rounded-full bg-fuchsia-50 px-2 py-0.5 text-[10px] font-black text-fuchsia-700">✨ Spotlight</span> : null}
              {expiresAt ? <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-black text-stone-500">招待期限 {formatExpiresAt(expiresAt)}</span> : null}
            </div>
            <h2 className="mt-1 truncate text-lg font-black">{moodLabel}</h2>
            <p className="mt-0.5 line-clamp-1 text-xs text-stone-600 sm:line-clamp-2">{moodDescription}</p>
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-3 gap-1.5 text-xs font-black sm:w-[220px]">
          <button type="button" disabled={creating} onClick={shareNoriCard} className="rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 px-3 py-2.5 text-white shadow-sm disabled:opacity-55">
            {creating ? "作成中" : "共有"}
          </button>
          <button type="button" disabled={creating} onClick={toggleQr} className="rounded-xl bg-stone-950 px-3 py-2.5 text-white shadow-sm disabled:opacity-55">
            QR
          </button>
          <button type="button" disabled={creating} onClick={copyNoriCard} className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-stone-800 shadow-sm disabled:opacity-55">
            {copied ? "済" : "コピー"}
          </button>
        </div>
      </div>

      {showLikes && totalLikeCount > 0 ? (
        <div className="mt-3 rounded-[1.35rem] border border-pink-100 bg-pink-50/80 p-3">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-pink-600">Nori Likes</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/80 p-3">
              <p className="text-sm font-black text-stone-900">今のノリ ♡{currentLikeCount}</p>
              <p className="mt-1 text-xs leading-5 text-stone-500">{likeSummary?.currentNames.length ? likeSummary.currentNames.join("、") : "まだいいねはありません"}</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-3">
              <p className="text-sm font-black text-stone-900">前のノリ {likeSummary?.previousMoodIcon ?? ""} {likeSummary?.previousMoodLabel ?? ""} ♡{previousLikeCount}</p>
              <p className="mt-1 text-xs leading-5 text-stone-500">{likeSummary?.previousNames.length ? likeSummary.previousNames.join("、") : "まだいいねはありません"}</p>
            </div>
          </div>
        </div>
      ) : null}

      {showQr && qrUrl ? (
        <div className="mt-3 flex flex-col gap-3 rounded-[1.35rem] border border-stone-100 bg-stone-950 p-3 text-white sm:flex-row sm:items-center">
          <div className="mx-auto rounded-2xl bg-white p-2 sm:mx-0">
            <img src={qrUrl} alt="eMoodition招待QR" className="h-32 w-32" />
          </div>
          <div className="min-w-0 text-center sm:text-left">
            <p className="text-sm font-black">QR招待</p>
            <p className="mt-1 text-xs leading-5 text-stone-300">友達と一緒にいる時は、このQRを見せるだけ。登録後に自動で友達になります。</p>
            {expiresAt ? <p className="mt-1 text-[11px] text-stone-400">期限 {formatExpiresAt(expiresAt)}</p> : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
