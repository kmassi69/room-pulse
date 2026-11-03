const STYLE = {
  hyped: { bar: 'bg-fuchsia-500', text: 'text-fuchsia-300' },
  upbeat: { bar: 'bg-emerald-500', text: 'text-emerald-300' },
  mixed: { bar: 'bg-amber-500', text: 'text-amber-300' },
  tense: { bar: 'bg-orange-500', text: 'text-orange-300' },
  gloomy: { bar: 'bg-sky-600', text: 'text-sky-300' },
}

export default function MoodCard({ pulse, lang }) {
  if (!pulse) {
    return (
      <section className="border-b border-slate-800 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Room Mood</p>
        <p className="mt-1 text-sm text-slate-500">Updates at the end of every over</p>
      </section>
    )
  }
  const st = STYLE[pulse.mood] ?? STYLE.mixed
  return (
    <section className="border-b border-slate-800 px-4 py-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold uppercase tracking-wide text-slate-400">Room Mood · after over {pulse.over}</span>
        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300">
          {pulse.source === 'llm' ? 'AI analysis' : 'Rule-based'}
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={`text-xl font-bold capitalize ${st.text}`}>{pulse.mood}</span>
        <span className="text-sm text-slate-400">{pulse.moodScore}/100</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div className={`h-full transition-all duration-700 ${st.bar}`} style={{ width: `${pulse.moodScore}%` }} />
      </div>
      <p className="mt-2 text-sm text-slate-200">{pulse.summary[lang] ?? pulse.summary.en}</p>
    </section>
  )
}