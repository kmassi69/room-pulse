export default function Controls({ playing, speed, onToggle, onReset, onSpeed }) {
  return (
    <footer className="flex items-center gap-2 border-t border-slate-800 bg-slate-900 px-4 py-3">
      <button onClick={onToggle} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold hover:bg-emerald-500">
        {playing ? 'Pause' : 'Play'}
      </button>
      <button onClick={onReset} className="rounded-lg bg-slate-700 px-3 py-2 text-sm hover:bg-slate-600">
        Reset
      </button>
      <div className="ml-auto flex gap-1">
        {[1, 2, 4].map((x) => (
          <button
            key={x}
            onClick={() => onSpeed(x)}
            className={`rounded-md px-2.5 py-1.5 text-xs font-semibold ${
              speed === x ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {x}x
          </button>
        ))}
      </div>
    </footer>
  )
}