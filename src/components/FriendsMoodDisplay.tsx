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

type OrbitNode = {
  item: FriendMoodViewItem;
  x: number;
  y: number;
  size: number;
  fontScale: "xl" | "lg" | "md" | "sm";
};

const MAX_ORBIT_BUBBLES = 24;
const APPROX_STAGE_WIDTH = 760;
const APPROX_STAGE_HEIGHT = 620;
const CENTER_CLEAR_RADIUS = 0.115;

const moodBias: Record<string, number> = {
  食事: -0.72,
  お酒: -0.25,
  ウキウキ: 0.06,
  ゲーム: 2.28,
  カフェ: 0.78,
  散歩: 1.56,
  会話: 0.33,
  作業: 2.76
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

function getDensityScale(count: number) {
  if (count <= 5) return 1;
  if (count <= 9) return 0.9;
  if (count <= 14) return 0.78;
  if (count <= 19) return 0.68;
  return 0.6;
}

function getBaseBubbleSize(item: FriendMoodViewItem, count: number) {
  const scale = getDensityScale(count);
  const base = item.spotlightActive ? 162 : item.freshness === "hot" ? 142 : item.freshness === "fresh" ? 118 : 96;
  return Math.max(item.spotlightActive ? 112 : 68, Math.round(base * scale));
}

function getFontScale(size: number): OrbitNode["fontScale"] {
  if (size >= 132) return "xl";
  if (size >= 108) return "lg";
  if (size >= 86) return "md";
  return "sm";
}

function getRingConfig(index: number, count: number, item: FriendMoodViewItem) {
  if (item.spotlightActive) return { radiusX: 0.19, radiusY: 0.18, phase: -Math.PI / 2 };

  if (count <= 5) return { radiusX: 0.34, radiusY: 0.31, phase: -Math.PI / 2 };
  if (count <= 9) {
    return index < 4
      ? { radiusX: 0.27, radiusY: 0.25, phase: -Math.PI / 2 }
      : { radiusX: 0.43, radiusY: 0.38, phase: -Math.PI / 3 };
  }
  if (count <= 14) {
    return index < 5
      ? { radiusX: 0.29, radiusY: 0.26, phase: -Math.PI / 2 }
      : { radiusX: 0.45, radiusY: 0.4, phase: -Math.PI / 2.6 };
  }

  if (index < 5) return { radiusX: 0.26, radiusY: 0.24, phase: -Math.PI / 2 };
  if (index < 14) return { radiusX: 0.4, radiusY: 0.36, phase: -Math.PI / 2.8 };
  return { radiusX: 0.48, radiusY: 0.43, phase: -Math.PI / 3.2 };
}

function getSlotsForRing(index: number, count: number) {
  if (count <= 5) return count;
  if (count <= 9) return index < 4 ? 4 : count - 4;
  if (count <= 14) return index < 5 ? 5 : count - 5;
  if (index < 5) return 5;
  if (index < 14) return 9;
  return Math.max(1, count - 14);
}

function getIndexInRing(index: number, count: number) {
  if (count <= 9) return index < 4 ? index : index - 4;
  if (count <= 14) return index < 5 ? index : index - 5;
  if (index < 5) return index;
  if (index < 14) return index - 5;
  return index - 14;
}

function createInitialOrbitNodes(items: FriendMoodViewItem[]) {
  const count = items.length;

  return items.map((item, index) => {
    const ring = getRingConfig(index, count, item);
    const slots = getSlotsForRing(index, count);
    const inRing = getIndexInRing(index, count);
    const moodOffset = moodBias[item.moodLabel ?? ""] ?? 0;
    const angle = ring.phase + (Math.PI * 2 * inRing) / slots + moodOffset * 0.18;
    const size = getBaseBubbleSize(item, count);

    return {
      item,
      x: 0.5 + Math.cos(angle) * ring.radiusX,
      y: 0.5 + Math.sin(angle) * ring.radiusY,
      size,
      fontScale: getFontScale(size)
    } satisfies OrbitNode;
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function relaxOrbitNodes(nodes: OrbitNode[]) {
  if (nodes.length <= 1) return nodes;

  const working = nodes.map((node) => ({ ...node }));
  const density = working.length;
  const overlapAllowance = density > 16 ? 0.58 : density > 10 ? 0.65 : 0.73;
  const centerRepel = density > 10 ? 0.018 : 0.028;

  for (let iteration = 0; iteration < 72; iteration += 1) {
    for (let i = 0; i < working.length; i += 1) {
      for (let j = i + 1; j < working.length; j += 1) {
        const a = working[i];
        const b = working[j];
        const dx = (a.x - b.x) * APPROX_STAGE_WIDTH;
        const dy = (a.y - b.y) * APPROX_STAGE_HEIGHT;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const minDistance = ((a.size + b.size) / 2) * overlapAllowance;

        if (distance < minDistance) {
          const push = ((minDistance - distance) / minDistance) * 0.006;
          const nx = dx / distance;
          const ny = dy / distance;
          const aWeight = b.item.spotlightActive ? 1.45 : 1;
          const bWeight = a.item.spotlightActive ? 1.45 : 1;

          a.x += nx * push * aWeight;
          a.y += ny * push * aWeight;
          b.x -= nx * push * bWeight;
          b.y -= ny * push * bWeight;
        }
      }
    }

    for (const node of working) {
      const dx = node.x - 0.5;
      const dy = node.y - 0.5;
      const centerDistance = Math.sqrt(dx * dx + dy * dy) || 1;
      const nodeRadius = (node.size / APPROX_STAGE_WIDTH) * 0.62;
      const clearRadius = CENTER_CLEAR_RADIUS + nodeRadius;

      if (centerDistance < clearRadius) {
        node.x += (dx / centerDistance) * centerRepel;
        node.y += (dy / centerDistance) * centerRepel;
      }

      const edgePaddingX = Math.max(0.075, node.size / APPROX_STAGE_WIDTH / 2 + 0.02);
      const edgePaddingY = Math.max(0.085, node.size / APPROX_STAGE_HEIGHT / 2 + 0.02);
      node.x = clamp(node.x, edgePaddingX, 1 - edgePaddingX);
      node.y = clamp(node.y, edgePaddingY, 1 - edgePaddingY);
    }
  }

  return working;
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

function getTextClasses(scale: OrbitNode["fontScale"]) {
  if (scale === "xl") return { name: "text-[12px] sm:text-sm", time: "text-[10px]" };
  if (scale === "lg") return { name: "text-[11px] sm:text-xs", time: "text-[9px]" };
  if (scale === "md") return { name: "text-[9px] sm:text-[10px]", time: "text-[8px]" };
  return { name: "text-[8px] sm:text-[9px]", time: "text-[7px]" };
}

function getAvatarClass(size: number) {
  if (size >= 132) return "h-14 w-14";
  if (size >= 108) return "h-12 w-12";
  if (size >= 86) return "h-10 w-10";
  return "h-8 w-8";
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
  const visibleItems = items.slice(0, MAX_ORBIT_BUBBLES);
  const orbitNodes = useMemo(() => relaxOrbitNodes(createInitialOrbitNodes(visibleItems)), [visibleItems]);
  const emptyBubbles = items.length > 0 && items.length < 5 ? createEmptyBubbles(5 - items.length) : [];
  const hiddenCount = Math.max(0, items.length - visibleItems.length);
  const [selectedId, setSelectedId] = useState(visibleItems[0]?.id ?? "");
  const selected = visibleItems.find((item) => item.id === selectedId) ?? visibleItems[0];
  const compactMode = items.length >= 10;

  return (
    <div className="mt-5 overflow-hidden rounded-[2rem] border border-white/70 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.95),transparent_34%),radial-gradient(circle_at_80%_30%,rgba(236,72,153,0.16),transparent_35%),radial-gradient(circle_at_50%_86%,rgba(20,184,166,0.14),transparent_42%)] p-4 shadow-inner">
      <div className="grid gap-4 xl:grid-cols-[1fr_260px]">
        <div className={`relative overflow-hidden rounded-[1.65rem] border border-white/60 bg-white/35 shadow-inner backdrop-blur-xl ${items.length >= 14 ? "min-h-[660px]" : "min-h-[540px] sm:min-h-[620px]"}`}>
          <div className="absolute left-1/2 top-1/2 h-[76%] w-[76%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/65" />
          <div className="absolute left-1/2 top-1/2 h-[54%] w-[54%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/65" />
          <div className="absolute left-1/2 top-1/2 h-[31%] w-[31%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/65" />
          <div className="absolute left-1/2 top-1/2 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/80 bg-white/80 text-center shadow-2xl backdrop-blur-xl sm:h-28 sm:w-28">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-pink-500">Orbit</p>
              <p className="mt-1 text-xs font-black text-stone-900 sm:text-sm">{compactMode ? "Compact" : "気分の距離感"}</p>
            </div>
          </div>

          {orbitNodes.map((node, index) => {
            const item = node.item;
            const isSelected = selected?.id === item.id;
            const text = getTextClasses(node.fontScale);
            const avatarClass = getAvatarClass(node.size);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                style={{ width: `${node.size}px`, height: `${node.size}px`, left: `${node.x * 100}%`, top: `${node.y * 100}%`, transform: "translate(-50%, -50%)" }}
                className={`group absolute rounded-full border p-2 text-center backdrop-blur-xl transition duration-300 hover:z-30 hover:scale-110 focus:z-30 focus:outline-none focus:ring-4 focus:ring-fuchsia-200 ${getBubbleClasses(item)} ${isSelected ? "z-20 scale-105" : `z-${Math.max(1, 19 - index)}`}`}
              >
                {item.spotlightActive ? <span className="absolute -inset-2 rounded-full bg-gradient-to-r from-fuchsia-400/25 via-violet-400/20 to-orange-300/25 blur-lg" /> : null}
                <span className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-full px-2">
                  <span className="relative">
                    <BubbleAvatar item={item} className={avatarClass} />
                    <span className={`${node.size < 82 ? "h-6 w-6 text-xs" : "h-7 w-7 text-sm"} absolute -right-2 -top-2 grid place-items-center rounded-full border border-white bg-white shadow-md`}>{item.moodIcon ?? "◌"}</span>
                    {item.spotlightActive ? <span className="absolute -left-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-600 text-xs text-white shadow-md">✨</span> : null}
                  </span>
                  <span className={`mt-2 max-w-[92%] truncate font-black text-stone-900 ${text.name}`}>{item.handleName}</span>
                  <span className={`mt-1 rounded-full px-2 py-0.5 font-black ${getBadgeClasses(item)} ${text.time}`}>{item.freshness === "normal" || compactMode ? compactTime(item.relativeTime) : item.relativeTime}</span>
                </span>
              </button>
            );
          })}

          {emptyBubbles.map((bubble, index) => (
            <div key={bubble.id} className="absolute grid h-16 w-16 place-items-center rounded-full border border-dashed border-white/80 bg-white/35 text-center text-[10px] font-black text-stone-300 shadow-sm" style={{ left: `${20 + index * 14}%`, top: `${82 - (index % 2) * 10}%`, transform: "translate(-50%, -50%)" }}>空</div>
          ))}

          {hiddenCount > 0 ? <div className="absolute bottom-4 right-4 rounded-full bg-stone-950/80 px-3 py-2 text-xs font-black text-white backdrop-blur">+{hiddenCount}人</div> : null}
          {compactMode ? <div className="absolute bottom-4 left-4 rounded-full border border-white/70 bg-white/80 px-3 py-2 text-xs font-black text-stone-600 backdrop-blur">Density scaled</div> : null}
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
