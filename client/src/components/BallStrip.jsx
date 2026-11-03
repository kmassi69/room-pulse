function chipFor(e) {
  if (e.wicket) return { label: 'W', cls: 'bg-red-600 text-white' }
  if (e.extras?.wides) return { label: 'Wd', cls: 'bg-amber-500 text-black' }
  if (e.runs >= 6) return { label: '6', cls: 'bg-fuchsia-600 text-white' }
  if (e.runs >= 4) return { label: '4', cls: 'bg-blue-600 text-white' }
  if (e.runs === 0) return { label: '•', cls: 'bg-slate-600 text-white' }
  return { label: String(e.runs), cls: 'bg-emerald-600 text-white' }
}

export default function BallStrip({ balls }) {
  const slots = Array.from({ length: 6 }, (_, i) => balls[balls.length - 6 + i] ?? null)
  return (
    <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3">
      <span className="mr-1 text-xs uppercase tracking-wide text-slate-400">Last 6</span>
      {slots.map((e, i) => {
        if (!e) return <span key={i} className="h-9 w-9 rounded-full border border-dashed border-slate-700" />
        const c = chipFor(e)
        return (
          <span key={e.id} className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${c.cls}`}>
            {c.label}
          </span>
        )
      })}
    </div>
  )
}