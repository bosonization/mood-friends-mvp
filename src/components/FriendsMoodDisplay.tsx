"use client";

import { useMemo, useState } from "react";
import { ContactActionPanel } from "@/components/ContactActionPanel";
import { FriendlessStarter } from "@/components/FriendlessStarter";
import { TransitionLink } from "@/components/TransitionLink";
import type { ViewMode } from "@/lib/viewMode";

export type FriendMoodViewItem = {
  id: string;
  handleName: string;
  tagline: string;
  avatarUrl: string | null;
  moodIcon: string | null;
  moodLabel: string | null;
  moodDescription: string | null;
  lastLoginAt: string | null;
  relativeTime: string;
  remainingTime: string | null;
  active: boolean;
  freshness: "hot" | "fresh" | "normal";
  spotlightActive?: boolean;
  spotlightExpiresAt?: string | null;
};

type FriendsMoodDisplayProps = {
  items: FriendMoodViewItem[];
  initialViewMode: ViewMode;
  inviteCode?: string;
  ownerName?: string;
};

const goldenAngle = Math.PI * (3 - Math.sqrt(5));
const moodBias: Record<string, number> = {
  食事: -0.75,
  お酒: -0.25,
  ウキウキ: 0.1,
  ゲーム: 2.35,
  カフェ: 0.75,
  散歩: 1.55,
  会話: 0.35,
  作業: 2.75
};

function getFreshnessRank(freshness: FriendMoodViewItem["freshness"]) {
  if (freshness === "hot") return 0;
  if (freshness === "fresh") return 1;
  return 2;
}

function getTimestamp(item: FriendMoodViewItem) {
  if (!item.lastLoginAt) return 0;
  return new Date(item.lastLoginAt).getTime();
}

function compactTime(relativeTime: string) {
  return relativeTime
    .replace("たった今", "now")
    .replace("分前", "m")
    .replace("時間前", "h")
    .replace("日前", "d");
}

function getBubbleSize(item: FriendMoodViewItem, index: number) {
  if (item.spotlightActive) return 158 + (index % 2) * 10;
  if (item.freshness === "hot") return 138 + (index % 2) * 12;
  if (item.freshness === "fresh") return 116 + (index % 3) * 8;
  return 92 + (index % 3) * 6;
}

function getBubbleStyle(item: FriendMoodViewItem, index: number) {
  const angle = index * goldenAngle + (moodBias[item.moodLabel ?? ""] ?? 0);
  const ring = item.spotlightActive ? 0.16 : item.freshness === "hot" ? 0.22 : item.freshness === "fresh" ? 0.34 : 0.43;
  const wobble = ((index % 4) - 1.5) * 0.018;
  const radius = ring + wobble;
  const x = 50 + Math.cos(angle) * radius * 100;
  const y = 50 + Math.sin(angle) * radius * 78;
  const size = getBubbleSize(item, index);

  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${Math.max(10, Math.min(90, x))}%`,
    top: `${Math.max(12, Math.min(88, y))}%`,
    transform: "translate(-50%, -50%)"
  } as const;
}

function getBubbleClasses(item: FriendMoodViewItem) {
  if (item.spotlightActive) return "border-fuchsia-200 bg-white/90 shadow-[0_0_48px_rgba(217,70,239,0.45)] ring-4 ring-fuchsia-200/90";
  if (item.freshness === "hot") return "border-red-200 bg-red-50/90 shadow-[0_0_38px_rgba(239,68,68,0.35)] ring-4 ring-red-100/80";
  if (item.freshness === "fresh") return "border-emerald-200 bg-emerald-50/90 shadow-[0_0_30px_rgba(16,185,129,0.25)] ring-4 ring-emerald-100/70";
  return "border-white/70 bg-white/75 shadow-xl shadow-stone-200/60";
}

function getBadgeClasses(item: FriendMoodViewItem) {
  if (item.spotlightActive) return "bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white";
  if (item.freshness === "hot") return "bg-red-500 text-white";
  if (item.freshness === "fresh") return "bg-emerald-500 text-white";
  return "bg-white/75 text-stone-600";
}

function getTextSize(item: FriendMoodViewItem) {
  if (item.spotlightActive || item.freshness === "hot") return { name: "text-[12px] sm:text-sm", time: "text-[10px]" };
  if (item.freshness === "fresh") return { name: "text-[11px] sm:text-xs", time: "text-[9px]" };
  return { name: "text-[9px] sm:text-[10px]", time: "text-[8px]" };
}

function createEmptyBubbles(count: number) {
  return Array.from({ length: count }, (_, index) => ({ id: `empty-${index}` }));
}

export function FriendsMoodDisplay({ items, initialViewMode, inviteCode, ownerName }: FriendsMoodDisplayProps) {
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (a.spotlightActive && !b.spotlightActive) return -1;
      if (!a.spotlightActive && b.spotlightActive) return 1;
      const freshnessDiff = getFreshnessRank(a.freshness) - getFreshnessRank(b.freshness);
      if (freshnessDiff !== 0) return freshnessDiff;
      return getTimestamp(b) - getTimestamp(a);
    });
  }, [items]);

  if (items.length === 0) {
    return (
      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-xl">
        <div className="flex items-end justify-between gap-4">
          <div><p className="text-sm font-bold text-pink-700">Friends</p><h2 className="text-2xl font-black">友達の今</h2></div>
          <p className="text-sm text-stone-500">0人</p>
        </div>
        <FriendlessStarter inviteCode={inviteCode} ownerName={ownerName} />
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-bold text-pink-700">Friends</p><h2 className="text-2xl font-black">友達の今</h2></div>
        <div className="text-right"><p className="text-sm text-stone-500">{items.length}人</p><TransitionLink href="/settings" className="text-xs font-bold text-stone-500 underline decoration-dotted underline-offset-4 hover:text-stone-900">表示形式を変更</TransitionLink></div>
      </div>
      {initialViewMode === "list" ? <PulseList items={sortedItems} /> : <MoodOrbit items={sortedItems} />}
    </section>
  );
}

function MoodOrbit({ items }: { items: FriendMoodViewItem[] }) {
  const visibleItems = items.slice(0, 18);
  const emptyBubbles = items.length > 0 && items.length < 5 ? createEmptyBubbles(5 - items.length) : [];
  const hiddenCount = Math.max(0, items.length - visibleItems.length);
  const [selectedId, setSelectedId] = useState(visibleItems[0]?.id ?? "");
  const selected = visibleItems.find((item) => item.id === selectedId) ?? visibleItems[0];

  return (
    <div className="mt-5 overflow-hidden rounded-[2rem] border border-white/70 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.95),transparent_34%),radial-gradient(circle_at_80%_30%,rgba(236,72,153,0.16),transparent_35%),radial-gradient(circle_at_50%_86%,rgba(20,184,166,0.14),transparent_42%)] p-4 shadow-inner">
      <div className="grid gap-4 xl:grid-cols-[1fr_260px]">
        <div className="relative min-h-[520px] overflow-hidden rounded-[1.65rem] border border-white/60 bg-white/35 shadow-inner backdrop-blur-xl sm:min-h-[600px]">
          <div className="absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70" />
          <div className="absolute left-1/2 top-1/2 h-[48%] w-[48%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70" />
          <div className="absolute left-1/2 top-1/2 h-[25%] w-[25%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70" />
          <div className="absolute left-1/2 top-1/2 grid h-28 w-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/80 bg-white/80 text-center shadow-2xl backdrop-blur-xl"><div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-pink-500">Orbit</p><p className="mt-1 text-sm font-black text-stone-900">気分の距離感</p></div></div>

          {visibleItems.map((item, index) => {
            const style = getBubbleStyle(item, index);
            const isSelected = selected?.id === item.id;
            const text = getTextSize(item);
            const avatarSize = item.spotlightActive || item.freshness === "hot" ? "h-14 w-14" : item.freshness === "fresh" ? "h-12 w-12" : "h-10 w-10";
            return (
              <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} style={style} className={`group absolute rounded-full border p-2 text-center backdrop-blur-xl transition duration-300 hover:z-20 hover:scale-110 focus:z-20 focus:outline-none focus:ring-4 focus:ring-fuchsia-200 ${getBubbleClasses(item)} ${isSelected ? "z-20 scale-105" : "z-10"}`}>
                {item.spotlightActive ? <span className="absolute -inset-2 rounded-full bg-gradient-to-r from-fuchsia-400/25 via-violet-400/20 to-orange-300/25 blur-lg" /> : null}
                <span className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-full px-2">
                  <span className="relative">
                    <BubbleAvatar item={item} className={avatarSize} />
                    <span className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full border border-white bg-white text-sm shadow-md">{item.moodIcon ?? "◌"}</span>
                    {item.spotlightActive ? <span className="absolute -left-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-600 text-xs text-white shadow-md">✨</span> : null}
                  </span>
                  <span className={`mt-2 max-w-[92%] truncate font-black text-stone-900 ${text.name}`}>{item.handleName}</span>
                  <span className={`mt-1 rounded-full px-2 py-0.5 font-black ${getBadgeClasses(item)} ${text.time}`}>{item.freshness === "normal" ? compactTime(item.relativeTime) : item.relativeTime}</span>
                </span>
              </button>
            );
          })}

          {emptyBubbles.map((bubble, index) => (
            <div key={bubble.id} className="absolute grid h-16 w-16 place-items-center rounded-full border border-dashed border-white/80 bg-white/35 text-center text-[10px] font-black text-stone-300 shadow-sm" style={{ left: `${20 + index * 14}%`, top: `${82 - (index % 2) * 10}%`, transform: "translate(-50%, -50%)" }}>空</div>
          ))}

          {hiddenCount > 0 ? <div className="absolute bottom-4 right-4 rounded-full bg-stone-950/80 px-3 py-2 text-xs font-black text-white backdrop-blur">+{hiddenCount}人</div> : null}
        </div>
        <SelectedFriendCard item={selected} />
      </div>
    </div>
  );
}

function SelectedFriendCard({ item }: { item?: FriendMoodViewItem }) {
  if (!item) return null;
  return (
    <div className="rounded-[1.65rem] border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur-xl">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-stone-400">Selected</p>
      <div className="mt-4">
        <div className="flex items-center gap-3"><BubbleAvatar item={item} className="h-16 w-16" /><div className="min-w-0"><p className="truncate text-lg font-black">{item.spotlightActive ? "✨ " : ""}{item.handleName}</p><p className="truncate text-sm text-stone-500">{item.tagline || "一言未設定"}</p></div></div>
        <div className="mt-5 rounded-[1.4rem] bg-stone-950 p-4 text-white">
          <div className="flex items-center gap-3"><span className="text-5xl">{item.moodIcon ?? "◌"}</span><div><p className="text-xl font-black">{item.moodLabel ?? "未登録"}</p><p className="text-sm text-stone-300">{item.moodDescription ?? "まだ気分がありません"}</p></div></div>
          <p className="mt-4 text-xs text-stone-400">{item.relativeTime}</p>
          {item.active && item.remainingTime ? <p className="mt-1 text-xs text-stone-400">現在のセッション 残り {item.remainingTime}</p> : null}
          {item.spotlightActive ? <p className="mt-2 rounded-full bg-fuchsia-500/20 px-3 py-2 text-xs font-black text-fuchsia-100">✨ Spotlight中</p> : null}
        </div>
        <ContactActionPanel handleName={item.handleName} moodLabel={item.moodLabel} moodIcon={item.moodIcon} relativeTime={item.relativeTime} />
      </div>
    </div>
  );
}

function PulseList({ items }: { items: FriendMoodViewItem[] }) {
  return (
    <div className="mt-5 space-y-3">
      {items.map((item) => {
        const accent = item.spotlightActive
          ? "border-fuchsia-200 bg-fuchsia-50/90 shadow-fuchsia-100"
          : item.freshness === "hot"
            ? "border-red-200 bg-red-50/90 shadow-red-100"
            : item.freshness === "fresh"
              ? "border-emerald-200 bg-emerald-50/90 shadow-emerald-100"
              : "border-stone-100 bg-white shadow-sm";
        const timeBadge = item.spotlightActive
          ? "bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white"
          : item.freshness === "hot"
            ? "bg-red-500 text-white"
            : item.freshness === "fresh"
              ? "bg-emerald-500 text-white"
              : "bg-stone-100 text-stone-500";

        return (
          <article key={item.id} className={`flex items-center gap-3 rounded-3xl border p-4 shadow-sm ${accent}`}>
            <BubbleAvatar item={item} className="h-14 w-14" />
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-bold">{item.spotlightActive ? "✨ " : ""}{item.handleName}</h3>{item.tagline ? <span className="rounded-full bg-white/75 px-2 py-1 text-xs text-stone-700">{item.tagline}</span> : null}</div><p className="mt-1 text-sm font-bold text-stone-700">{item.moodIcon ? `${item.moodIcon} ${item.moodLabel}` : "まだ気分未登録"}</p></div>
            <div className="shrink-0 text-right"><p className={`rounded-full px-3 py-1 text-xs font-black ${timeBadge}`}>{item.relativeTime}</p>{item.active && item.remainingTime ? <p className="mt-1 text-[11px] text-stone-500">残り {item.remainingTime}</p> : null}</div>
          </article>
        );
      })}
    </div>
  );
}

function BubbleAvatar({ item, className }: { item: FriendMoodViewItem; className: string }) {
  const initial = item.handleName.slice(0, 1) || "？";
  if (item.avatarUrl) return <img src={item.avatarUrl} alt={`${item.handleName}のアイコン`} className={`${className} rounded-full border border-white object-cover shadow-sm`} />;
  return <span className={`${className} grid place-items-center rounded-full border border-white bg-gradient-to-br from-orange-100 to-pink-100 font-black text-orange-700 shadow-sm`}>{initial}</span>;
}
