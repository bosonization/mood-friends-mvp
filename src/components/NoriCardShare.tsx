"use client";

import { useMemo, useState } from "react";

type NoriCardShareProps = {
  memberCode: string;
  handleName: string;
  moodIcon: string;
  moodLabel: string;
  moodDescription: string;
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

export function NoriCardShare({ memberCode, handleName, moodIcon, moodLabel, moodDescription }: NoriCardShareProps) {
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);

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

  const qrUrl = inviteUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=14&data=${encodeURIComponent(inviteUrl)}` : null;

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black text-pink-700">Nori Card</p>
          <h2 className="mt-1 text-2xl font-black">このノリを友達に見せる</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-stone-600">
            ただの招待ではなく、今置いているノリをきっかけに送れます。リンクは24時間有効で、登録後は自動で友達になります。
          </p>
        </div>
        {expiresAt ? <p className="rounded-full bg-stone-100 px-3 py-2 text-xs font-black text-stone-600">期限 {formatExpiresAt(expiresAt)}</p> : null}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_220px]">
        <div className="rounded-[1.6rem] border border-orange-100 bg-gradient-to-br from-orange-50 via-pink-50 to-white p-5 shadow-inner">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">今このノリ</p>
          <div className="mt-4 flex items-center gap-4">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-[1.6rem] bg-white text-5xl shadow-lg shadow-orange-100">{moodIcon}</div>
            <div className="min-w-0">
              <h3 className="text-2xl font-black">{moodLabel}</h3>
              <p className="mt-1 text-sm leading-6 text-stone-600">{moodDescription}</p>
            </div>
          </div>
          <p className="mt-4 rounded-2xl bg-white/75 px-4 py-3 text-sm leading-6 text-stone-600">
            「アプリ使って」ではなく、「今このノリ置いてる」を友達に送る導線です。
          </p>
        </div>

        <div className="rounded-[1.6rem] border border-white/70 bg-stone-950 p-4 text-white shadow-lg">
          <p className="text-sm font-black text-stone-300">QR招待</p>
          {showQr && qrUrl ? (
            <div className="mt-3 rounded-2xl bg-white p-3">
              <img src={qrUrl} alt="eMoodition招待QR" className="mx-auto h-44 w-44" />
            </div>
          ) : (
            <div className="mt-3 grid h-44 place-items-center rounded-2xl border border-white/10 bg-white/5 text-center text-sm text-stone-400">
              友達と一緒にいる時は<br />QRでその場登録
            </div>
          )}
          <p className="mt-3 text-xs leading-5 text-stone-400">このQRも24時間有効です。</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-sm font-black">
        <button type="button" disabled={creating} onClick={shareNoriCard} className="rounded-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 px-4 py-3 text-white shadow-lg shadow-pink-100 disabled:opacity-55">{creating ? "作成中" : "共有"}</button>
        <button type="button" disabled={creating} onClick={toggleQr} className="rounded-2xl bg-stone-950 px-4 py-3 text-white shadow-sm disabled:opacity-55">QR</button>
        <button type="button" disabled={creating} onClick={copyNoriCard} className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-800 shadow-sm disabled:opacity-55">{copied ? "コピー済み" : "コピー"}</button>
      </div>
    </section>
  );
}
