const LANGS = [
  ['en', 'English'],
  ['hinglish', 'Hinglish'],
]

export default function Header({ teams, last, lang, onLang, note }) {
  const team = last?.team ?? teams[0]
  const score = last ? `${last.score.runs}/${last.score.wickets}` : '0/0'
  const overs = last ? last.score.overs : '0.0'
  return (
    <header className="border-b border-slate-800 bg-slate-900 px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">{teams[0]} vs {teams[1]}</span>
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-md border border-slate-700 text-[11px] font-semibold">
            {LANGS.map(([k, name]) => (
              <button
                key={k}
                onClick={() => onLang(k)}
                className={`px-2 py-1 ${lang === k ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-300'}`}
              >
                {name}
              </button>
            ))}
          </div>
          <span className="rounded bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-black">
            Replay
          </span>
        </div>
      </div>
      <div className="mt-1 flex items-baseline gap-3">
        <span className="text-3xl font-bold">{team} {score}</span>
        <span className="text-sm text-slate-400">{overs} ov</span>
      </div>
      <p className="mt-1 text-[11px] text-slate-500">Hand-written sample match, fictional teams. Not live.</p>
      {note && <p className="mt-0.5 text-[11px] text-amber-400">{note}</p>}
    </header>
  )
}