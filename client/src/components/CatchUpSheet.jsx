const label = (e) => (e.wicket ? 'W' : e.extras?.wides ? 'Wd' : e.runs === 0 ? '•' : String(e.runs))

export default function CatchUpSheet({ open, onClose, unseen, live, lang }) {
  if (!open) return null
  const liveOver = live.length ? live[0].over : null
  const liveScore = live.length ? live[live.length - 1].score : null
  const empty = unseen.length === 0 && live.length === 0

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60" onClick={onClose}>
      <div
        className="mx-auto max-h-[75dvh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-slate-900 p-4 text-slate-100 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Catch me up</h2>
          <button onClick={onClose} className="rounded-md bg-slate-800 px-3 py-1 text-sm hover:bg-slate-700">
            Got it
          </button>
        </div>
        <p className="mt-0.5 text-xs text-slate-400">What you missed since you last checked</p>

        {empty && <p className="py-6 text-center text-sm text-slate-500">Nothing yet. Press Play to start the replay.</p>}

        {unseen.map((p) => (
          <div key={p.over} className="mt-3 rounded-lg bg-slate-800 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">After over {p.over}</span>
              <span className="rounded bg-slate-700 px-1.5 py-0.5 text-[10px] text-slate-300">
                {p.source === 'llm' ? 'AI recap' : 'Rule-based recap'} · room felt {p.mood}
              </span>
            </div>
            <p className="mt-1.5 text-sm">{p.catchUp[lang] ?? p.catchUp.en}</p>
          </div>
        ))}

        {unseen.length === 0 && live.length > 0 && (
          <p className="mt-3 text-sm text-emerald-300">You are up to date on every completed over.</p>
        )}

        {live.length > 0 && (
          <div className="mt-3 rounded-lg border border-slate-700 p-3">
            <p className="text-xs font-semibold text-slate-300">Over {liveOver} so far</p>
            <p className="mt-1 text-sm">
              {live.map(label).join(' · ')}
              {liveScore && <span className="text-slate-400">  ({liveScore.runs}/{liveScore.wickets})</span>}
            </p>
            <p className="mt-1 text-[10px] text-slate-500">Auto-generated from match events. The AI recap comes at the end of the over.</p>
          </div>
        )}

        <p className="mt-4 text-[10px] text-slate-500">Replay of a sample match with simulated chat.</p>
      </div>
    </div>
  )
}