export function AdSlot({ label = "広告" }: { label?: string }) {
  const enabled = process.env.NEXT_PUBLIC_ENABLE_ADS === "true";

  if (!enabled) return null;

  return (
    <aside className="rounded-[1.5rem] border border-dashed border-stone-300 bg-white/60 p-4 text-center text-sm text-stone-500">
      <p className="mb-2 text-xs font-black tracking-widest text-stone-400">{label}</p>
      <p>広告枠です。掲載時はPR/広告であることを明確に表示します。</p>
    </aside>
  );
}
