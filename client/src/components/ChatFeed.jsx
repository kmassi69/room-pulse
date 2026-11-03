import { useEffect, useRef } from 'react'

const COLORS = [
  'text-rose-400', 'text-amber-400', 'text-lime-400', 'text-emerald-400',
  'text-cyan-400', 'text-sky-400', 'text-violet-400', 'text-fuchsia-400',
]
const colorFor = (user) => {
  let h = 0
  for (const ch of user) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return COLORS[h % COLORS.length]
}

export default function ChatFeed({ messages, info, count }) {
  const box = useRef(null)
  useEffect(() => {
    const el = box.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length])

  const badge = !info ? '' : info.anyFallback ? 'includes canned fallback' : 'AI-generated'

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-2 px-4 py-2 text-xs text-slate-400">
        <span className="font-semibold uppercase tracking-wide">Live chat · {count} msgs</span>
        <span className="text-right">Simulated chat · {badge}</span>
      </div>
      <div ref={box} className="flex-1 space-y-1.5 overflow-y-auto px-4 pb-2">
        {messages.length === 0 && (
          <p className="pt-8 text-center text-sm text-slate-500">Press Play to start the replay</p>
        )}
        {messages.map((m) => (
          <p key={m.key} className="text-sm leading-snug">
            <span className={`font-semibold ${colorFor(m.user)}`}>{m.user}</span>{' '}
            <span className="text-slate-200">{m.text}</span>
          </p>
        ))}
      </div>
    </section>
  )
}