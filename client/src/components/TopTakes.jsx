export default function TopTakes({ pulse }) {
  if (!pulse) return null
  return (
    <section className="border-b border-slate-800 py-2">
      <p className="px-4 pb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Top takes · recognised for free
      </p>
      <div className="flex snap-x gap-2 overflow-x-auto px-4 pb-1">
        {pulse.topTakes.map((t) => (
          <div key={`${t.user}-${t.ball}`} className="min-w-[70%] snap-start rounded-lg bg-slate-800 px-3 py-2">
            <p className="text-xs font-semibold text-amber-300">★ {t.user}</p>
            <p className="text-sm text-slate-100">{t.text}</p>
            {t.why && <p className="mt-0.5 text-[11px] text-slate-500">{t.why}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}