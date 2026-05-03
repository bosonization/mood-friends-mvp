"use client";

import { useMemo, useState } from "react";
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
};

type FriendsMoodDisplayProps = {
  items: FriendMoodViewItem[];
  initialViewMode: ViewMode;
};

type BubbleSize = "large" | "medium" | "small";

const moodColors: Record<string, string> = {
  食事: "from-orange-200 via-amber-100 to-white",
  お酒: "from-yellow-200 via-orange-100 to-white",
  ウキウキ: "from-pink-200 via-rose-100 to-white",
  ゲーム: "from-violet-200 via-indigo-100 to-white",
  カフェ: "from-stone-200 via-orange-50 to-white",
  散歩: "from-emerald-200 via-lime-100 to-white",
  会話: "from-sky-200 via-cyan-100 to-white",
  作業: "from-blue-200 via-slate-100 to-white"
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

function getBubbleSizeType(item: FriendMoodViewItem): BubbleSize {
  if (item.freshness === "hot") return "large";
  if (item.freshness === "fresh") return "medium";
  return "small";
}

function getBubbleSizePx(size: BubbleSize, index: number) {
  if (size === "large") return 148 + (index % 2) * 10;
  if (size === "medium") return 120 + (index % 3) * 7;
  return 92 + (index % 3) * 4;
}

function getBubbleStyle(item: FriendMoodViewItem, index: number) {
  const sizeType = getBubbleSizeType(item);
  const angle = index * goldenAngle + (moodBias[item.moodLabel ?? ""] ?? 0);
  const ring = sizeType === "large" ? 0.2 : sizeType === "medium" ? 0.34 : 0.45;
  const wobble = ((index % 4) - 1.5) * 0.018;
  const radius = ring + wobble;
  const x = 50 + Math.cos(angle) * radius * 100;
  const y = 50 + Math.sin(angle) * radius * 78;
  const size = getBubbleSizePx(sizeType, index);

  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${Math.max(10, Math.min(90, x))}%`,
    top: `${Math.max(12, Math.min(88, y))}%`,
    transform: "translate(-50%, -50%)"
  } as const;
}

function getBubbleClasses(item: FriendMoodViewItem) {
  if (item.freshness === "hot") {
    return "border-red-200/90 bg-white/80 shadow-[0_0_44px_rgba(239,68,68,0.32)] ring-4 ring-red-200/70";
  }
  if (item.freshness === "fresh") {
    return "border-emerald-200/90 bg-white/78 shadow-[0_0_34px_rgba(16,185,129,0.25)] ring-4 ring-emerald-200/65";
  }
  return "border-white/75 bg-white/68 shadow-xl shadow-stone-200/60 ring-1 ring-white/75";
}

function getBubbleLabelClasses(sizeType: BubbleSize) {
  if (sizeType === "large") return "mt-2 max-w-[92%] text-[12px] sm:text-[13px]";
  if (sizeType === "medium") return "mt-1.5 max-w-[90%] text-[11px] sm:text-[12px]";
  return "mt-1 max-w-[86%] text-[9px] sm:text-[10px]";
}

function getBubbleTimeClasses(sizeType: BubbleSize) {
  if (sizeType === "large") return "mt-1 max-w-[88%] text-[10px] sm:text-[11px]";
  if (sizeType === "medium") return "mt-0.5 max-w-[86%] text-[9px] sm:text-[10px]";
  return "mt-0.5 max-w-[78%] text-[8px] sm:text-[9px]";
}

function getMoodBadgeClasses(item: FriendMoodViewItem) {
  if (item.freshness === "hot") return "border-red-100 bg-red-500 text-white shadow-lg shadow-red-200";
  if (item.freshness === "fresh") return "border-emerald-100 bg-emerald-500 text-white shadow-lg shadow-emerald-200";
  return "border-white bg-white/90 text-stone-700 shadow-md shadow-stone-200";
}

function getMoodBadgeSize(sizeType: BubbleSize) {
  if (sizeType === "large") return "right-4 top-4 h-9 w-9 text-xl";
  if (sizeType === "medium") return "right-3 top-3 h-8 w-8 text-lg";
  return "right-2 top-2 h-7 w-7 text-base";
}

function getAvatarSize(sizeType: BubbleSize) {
  if (sizeType === "large") return "h-16 w-16 text-2xl sm:h-[4.6rem] sm:w-[4.6rem]";
  if (sizeType === "medium") return "h-13 w-13 text-xl sm:h-14 sm:w-14";
  return "h-10 w-10 text-base sm:h-11 sm:w-11";
}

function getCenterAvatarSize(sizeType: BubbleSize) {
  if (sizeType === "large") return "h-[4.15rem] w-[4.15rem] text-2xl sm:h-[4.7rem] sm:w-[4.7rem]";
  if (sizeType === "medium") return "h-14 w-14 text-xl sm:h-16 sm:w-16";
  return "h-10 w-10 text-base sm:h-11 sm:w-11";
}

function formatCompactTime(input: string | null | undefined, fallback: string) {
  if (!input) return fallback;
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(input).getTime()) / 1000 / 60));
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  return fallback;
}

export function FriendsMoodDisplay({ items, initialViewMode }: FriendsMoodDisplayProps) {
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const freshnessDiff = getFreshnessRank(a.freshness) - getFreshnessRank(b.freshness);
      if (freshnessDiff !== 0) return freshnessDiff;
      return getTimestamp(b) - getTimestamp(a);
    });
  }, [items]);

  if (items.length === 0) {
    return (
      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-pink-700">Friends</p>
            <h2 className="text-2xl font-black">友達の今</h2>
          </div>
          <p className="text-sm text-stone-500">0人</p>
        </div>
        <p className="mt-6 rounded-3xl border border-dashed border-orange-200 p-5 text-sm leading-6 text-stone-600">
          まだ友達がいません。友達ページで会員コードから申請できます。
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-pink-700">Friends</p>
          <h2 className="text-2xl font-black">友達の今</h2>
        </div>
        <div className="text-right">
          <p className="text-sm text-stone-500">{items.length}人</p>
          <TransitionLink href="/settings" className="text-xs font-bold text-stone-500 underline decoration-dotted underline-offset-4 hover:text-stone-900">
            表示形式を変更
          </TransitionLink>
        </div>
      </div>

      {initialViewMode === "list" ? <PulseList items={sortedItems} /> : <MoodOrbit items={sortedItems} />}
    </section>
  );
}

function MoodOrbit({ items }: { items: FriendMoodViewItem[] }) {
  const visibleItems = items.slice(0, 18);
  const hiddenCount = Math.max(0, items.length - visibleItems.length);
  const [selectedId, setSelectedId] = useState(visibleItems[0]?.id ?? "");
  const selected = visibleItems.find((item) => item.id === selectedId) ?? visibleItems[0];

  return (
    <div className="mt-5 overflow-hidden rounded-[2rem] border border-white/70 bg-[radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.96),transparent_32%),radial-gradient(circle_at_78%_26%,rgba(244,63,94,0.14),transparent_35%),radial-gradient(circle_at_45%_82%,rgba(16,185,129,0.14),transparent_43%)] p-4 shadow-inner">
      <div className="grid gap-4 xl:grid-cols-[1fr_270px]">
        <div className="relative min-h-[540px] overflow-hidden rounded-[1.65rem] border border-white/60 bg-white/35 shadow-inner backdrop-blur-xl sm:min-h-[620px]">
          <div className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70" />
          <div className="absolute left-1/2 top-1/2 h-[53%] w-[53%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70" />
          <div className="absolute left-1/2 top-1/2 h-[28%] w-[28%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70" />
          <div className="absolute left-1/2 top-1/2 h-[11rem] w-[11rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-white/85 via-white/50 to-white/20 blur-xl" />

          <div className="absolute left-1/2 top-1/2 grid h-28 w-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/80 bg-white/80 text-center shadow-2xl backdrop-blur-xl">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-pink-500">Orbit</p>
              <p className="mt-1 text-sm font-black text-stone-900">気分の気配</p>
            </div>
          </div>

          {visibleItems.map((item, index) => {
            const style = getBubbleStyle(item, index);
            const gradient = moodColors[item.moodLabel ?? ""] ?? "from-stone-100 via-white to-white";
            const isSelected = selected?.id === item.id;
            const sizeType = getBubbleSizeType(item);
            const compactTime = formatCompactTime(item.lastLoginAt, item.relativeTime);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                style={style}
                className={`group absolute rounded-full border p-2 text-center backdrop-blur-xl transition duration-300 hover:z-20 hover:scale-110 focus:z-20 focus:outline-none focus:ring-4 focus:ring-fuchsia-200 ${getBubbleClasses(item)} ${isSelected ? "z-20 scale-105" : "z-10"}`}
                aria-label={`${item.handleName} ${item.moodLabel ?? "未登録"} ${item.relativeTime}`}
              >
                <span className={`absolute inset-1 rounded-full bg-gradient-to-br ${gradient} opacity-65`} />
                <span className="absolute inset-0 rounded-full bg-white/20" />
                <span className={`absolute grid place-items-center rounded-full border ${getMoodBadgeClasses(item)} ${getMoodBadgeSize(sizeType)}`}>
                  {item.moodIcon ?? "◌"}
                </span>
                <span className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-full px-2">
                  <FriendAvatar item={item} className={getCenterAvatarSize(sizeType)} />
                  <span className={`${getBubbleLabelClasses(sizeType)} block truncate font-black leading-none text-stone-950 drop-shadow-sm`}>
                    {item.handleName}
                  </span>
                  <span className={`${getBubbleTimeClasses(sizeType)} block truncate font-black leading-none text-stone-600`}>
                    {compactTime}
                  </span>
                </span>
              </button>
            );
          })}

          {hiddenCount > 0 ? (
            <div className="absolute bottom-4 right-4 rounded-full bg-stone-950/80 px-3 py-2 text-xs font-black text-white backdrop-blur">
              +{hiddenCount}人
            </div>
          ) : null}
        </div>

        <SelectedFriendCard selected={selected} />
      </div>
    </div>
  );
}

function SelectedFriendCard({ selected }: { selected?: FriendMoodViewItem }) {
  if (!selected) return null;

  return (
    <div className="rounded-[1.65rem] border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur-xl">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-stone-400">Selected</p>
      <div className="mt-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <FriendAvatar item={selected} className="h-16 w-16 text-2xl" />
            <span className={`absolute -right-1 -top-1 grid h-8 w-8 place-items-center rounded-full border ${getMoodBadgeClasses(selected)}`}>
              {selected.moodIcon ?? "◌"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-black">{selected.handleName}</p>
            <p className="truncate text-sm text-stone-500">{selected.tagline || "一言未設定"}</p>
          </div>
        </div>
        <div className="mt-5 rounded-[1.4rem] bg-stone-950 p-4 text-white">
          <div className="flex items-center gap-3">
            <span className="text-5xl">{selected.moodIcon ?? "◌"}</span>
            <div>
              <p className="text-xl font-black">{selected.moodLabel ?? "未登録"}</p>
              <p className="text-sm text-stone-300">{selected.moodDescription ?? "まだ気分がありません"}</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-stone-400">{selected.relativeTime}</p>
          {selected.active && selected.remainingTime ? (
            <p className="mt-1 text-xs text-stone-400">現在のセッション 残り {selected.remainingTime}</p>
          ) : null}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
          <span className="rounded-full bg-red-100 px-2 py-2 text-red-700">1時間以内</span>
          <span className="rounded-full bg-emerald-100 px-2 py-2 text-emerald-700">6時間以内</span>
          <span className="rounded-full bg-stone-100 px-2 py-2 text-stone-500">その他</span>
        </div>
      </div>
    </div>
  );
}

function PulseList({ items }: { items: FriendMoodViewItem[] }) {
  return (
    <div className="mt-5 space-y-3">
      {items.map((item) => {
        const accent = item.freshness === "hot"
          ? "border-red-200 bg-red-50/90 shadow-red-100"
          : item.freshness === "fresh"
            ? "border-emerald-200 bg-emerald-50/90 shadow-emerald-100"
            : "border-stone-100 bg-white shadow-sm";
        const timeBadge = item.freshness === "hot"
          ? "bg-red-500 text-white"
          : item.freshness === "fresh"
            ? "bg-emerald-500 text-white"
            : "bg-stone-100 text-stone-500";

        return (
          <article key={item.id} className={`flex items-center gap-3 rounded-3xl border p-4 shadow-sm ${accent}`}>
            <FriendAvatar item={item} className="h-14 w-14 text-xl" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate font-bold">{item.handleName}</h3>
                {item.tagline ? <span className="rounded-full bg-white/75 px-2 py-1 text-xs text-stone-700">{item.tagline}</span> : null}
              </div>
              <p className="mt-1 text-sm font-bold text-stone-700">{item.moodIcon ? `${item.moodIcon} ${item.moodLabel}` : "まだ気分未登録"}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className={`rounded-full px-3 py-1 text-xs font-black ${timeBadge}`}>{item.relativeTime}</p>
              {item.active && item.remainingTime ? <p className="mt-1 text-[11px] text-stone-500">残り {item.remainingTime}</p> : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function FriendAvatar({ item, className }: { item: FriendMoodViewItem; className: string }) {
  const initial = item.handleName.slice(0, 1) || "？";

  if (item.avatarUrl) {
    return <img src={item.avatarUrl} alt={`${item.handleName}のアイコン`} className={`${className} rounded-full border-2 border-white object-cover shadow-sm`} />;
  }

  return (
    <div className={`${className} grid place-items-center rounded-full border-2 border-white bg-gradient-to-br from-orange-100 to-pink-100 font-black text-orange-700 shadow-sm`}>
      {initial}
    </div>
  );
}
