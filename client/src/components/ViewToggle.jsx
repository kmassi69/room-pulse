const OPTIONS = [
  ['before', 'Without Room Pulse'],
  ['after', 'With Room Pulse'],
]

export default function ViewToggle({ view, onView }) {
  return (
    <div className="flex gap-1 border-b border-slate-800 bg-slate-900 px-4 py-2">
      {OPTIONS.map(([k, name]) => (
        <button
          key={k}
          onClick={() => onView(k)}
          className={`flex-1 rounded-md py-1.5 text-xs font-semibold ${
            view === k ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-300'
          }`}
        >
          {name}
        </button>
      ))}
    </div>
  )
}