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
  stealthActive?: boolean;
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

function NamesPill({ names }: { names: string[] }) {
  if (names.length === 0) return <p className="text-xs text-stone-400">まだいいねはありません</p>;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {names.slice(0, 8).map((name, index) => (
        <span key={`${name}-${index}`} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-stone-700 shadow-sm">
          {name}
        </span>
      ))}
      {names.length > 8 ? <span className="rounded-full bg-stone-900 px-2.5 py-1 text-[11px] font-black text-white">+{names.length - 8}</span> : null}
    </div>
  );
}

export function NoriCardShare({ memberCode, handleName, moodIcon, moodLabel, moodDescription, remainingTime, spotlightActive, stealthActive, likeSummary }: NoriCardShareProps) {
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
    return `${handleName}さんがNoriDropで今このノリをDropしています。\n\n${moodIcon} ${moodLabel}\n${moodDescription}\n\n友達の「今どんなノリ？」がわかるアプリです。\n会員コード: ${memberCode}`;
  }, [handleName, moodIcon, moodLabel, moodDescription, memberCode]);

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

  function buildMessage(url: string) {
    return `${baseMessage}\n招待リンク: ${url}`;
  }

  async function shareNoriCard() {
    try {
      const invite = await ensureInvite();
      if (navigator.share) {
        await navigator.share({ title: "NoriDropのNori Card", text: baseMessage, url: invite.url });
        return;
      }
      await navigator.clipboard.writeText(buildMessage(invite.url));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      alert("招待リンクを作成できませんでした。Supabase SQLが実行済みか確認してください。");
    }
  }

  async function copyNoriCard() {
    try {
      const invite = await ensureInvite();
      await navigator.clipboard.writeText(buildMessage(invite.url));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      alert("招待リンクをコピーできませんでした。Supabase SQLが実行済みか確認してください。");
    }
  }

  async function toggleQr() {
    try {
      await ensureInvite();
      setShowQr((current) => !current);
    } catch {
      alert("QR招待を作成できませんでした。Supabase SQLが実行済みか確認してください。");
    }
  }

  const qrUrl = inviteUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&data=${encodeURIComponent(inviteUrl)}` : null;

  return (
    <section className="overflow-hidden rounded-[1.8rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(239,253,244,0.86))] p-4 shadow-sm backdrop-blur-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-[1.35rem] bg-gradient-to-br from-emerald-50 via-white to-[#fff1ee] text-4xl shadow-lg shadow-emerald-100">
            <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-gradient-to-r from-[#063f2e] to-[#12915f] shadow-sm" />
            {moodIcon}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-800">Nori Card</p>
              {remainingTime ? <span className={`rounded-full px-2.5 py-1 text-[10px] font-black shadow-sm ${stealthActive ? "bg-stone-950 text-white" : "bg-gradient-to-r from-[#063f2e] via-[#0b6b47] to-[#12915f] text-white"}`}>{stealthActive ? "Quiet" : `変更まで ${remainingTime}`}</span> : null}
              {totalLikeCount > 0 ? (
                <button
                  type="button"
                  onClick={() => setShowLikes((current) => !current)}
                  className="group inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#ff6b5f] to-rose-500 px-3 py-1 text-[10px] font-black text-white shadow-lg shadow-rose-100 transition hover:scale-[1.03]"
                >
                  <span className="text-xs">♥</span>
                  <span>{totalLikeCount}</span>
                </button>
              ) : (
                <span className="rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-black text-stone-400 shadow-sm">♥ 0</span>
              )}
              {spotlightActive ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-800">✨ Spotlight</span> : null}
              {expiresAt ? <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-black text-stone-500">招待期限 {formatExpiresAt(expiresAt)}</span> : null}
            </div>
            <h2 className="mt-1 truncate text-lg font-black text-stone-950">{moodLabel}</h2>
            <p className="mt-0.5 line-clamp-1 text-xs text-stone-600 sm:line-clamp-2">{moodDescription}</p>
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-3 gap-1.5 text-xs font-black sm:w-[220px]">
          <button type="button" disabled={creating} onClick={shareNoriCard} className="rounded-xl bg-gradient-to-r from-[#063f2e] via-[#0b6b47] to-[#12915f] px-3 py-2.5 text-white shadow-sm disabled:opacity-55">
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
        <div className="mt-3 rounded-[1.45rem] border border-emerald-100 bg-[radial-gradient(circle_at_0%_0%,rgba(16,185,129,0.18),transparent_36%),rgba(255,255,255,0.8)] p-3 shadow-inner">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-800">Nori Likes</p>
              <h3 className="mt-1 text-sm font-black text-stone-950">あなたのノリに届いた反応</h3>
            </div>
            <span className="rounded-full bg-stone-950 px-3 py-1 text-xs font-black text-white">♥ {totalLikeCount}</span>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/70 bg-white/80 p-3 shadow-sm">
              <p className="text-sm font-black text-stone-900">今のノリ <span className="text-[#ff6b5f]">♥{currentLikeCount}</span></p>
              <NamesPill names={likeSummary?.currentNames ?? []} />
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 p-3 shadow-sm">
              <p className="text-sm font-black text-stone-900">前のノリ {likeSummary?.previousMoodIcon ?? ""} {likeSummary?.previousMoodLabel ?? ""} <span className="text-[#ff6b5f]">♥{previousLikeCount}</span></p>
              <NamesPill names={likeSummary?.previousNames ?? []} />
            </div>
          </div>
        </div>
      ) : null}

      {showQr && qrUrl ? (
        <div className="mt-3 flex flex-col gap-3 rounded-[1.35rem] border border-stone-100 bg-stone-950 p-3 text-white sm:flex-row sm:items-center">
          <div className="mx-auto rounded-2xl bg-white p-2 sm:mx-0">
            <img src={qrUrl} alt="NoriDrop招待QR" className="h-32 w-32" />
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
