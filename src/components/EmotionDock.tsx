"use client";

import { usePathname } from "next/navigation";
import { TransitionLink } from "@/components/TransitionLink";

const items = [
  { href: "/home", icon: "✨", label: "今", match: ["/home", "/mood"] },
  { href: "/friends", icon: "👥", label: "友", match: ["/friends"] },
  { href: "/profile", icon: "🙂", label: "私", match: ["/profile"] },
  { href: "/settings", icon: "⚙️", label: "設", match: ["/settings", "/terms", "/privacy", "/disclosures"] }
];

export function EmotionDock() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-4 z-40 mt-6 sm:hidden" aria-label="メインナビゲーション">
      <div className="mx-auto flex w-fit items-center gap-3 rounded-[2rem] border border-white/70 bg-white/72 px-4 py-3 shadow-2xl shadow-emerald-100/70 backdrop-blur-2xl">
        {items.map((item) => {
          const active = item.match.some((path) => pathname.startsWith(path));
          return (
            <TransitionLink
              key={item.href}
              href={item.href}
              className="group flex min-w-12 flex-col items-center gap-1 text-[11px] font-black text-stone-500"
              aria-current={active ? "page" : undefined}
            >
              <span
                className={`grid h-12 w-12 place-items-center rounded-full border text-xl transition duration-300 group-hover:-translate-y-1 ${
                  active
                    ? "border-white bg-gradient-to-br from-[#063f2e] via-[#0b6b47] to-[#12915f] text-white shadow-lg shadow-emerald-200 ring-4 ring-pink-100"
                    : "border-white/80 bg-white/80 text-stone-700 shadow-sm shadow-stone-200/70"
                }`}
              >
                {item.icon}
              </span>
              <span className={active ? "text-emerald-800" : "text-stone-500"}>{item.label}</span>
            </TransitionLink>
          );
        })}
      </div>
    </nav>
  );
}
