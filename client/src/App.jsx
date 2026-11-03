import { useEffect, useRef, useState } from 'react'
import { fixture } from './data/fixture.js'
import { flattenDeliveries, createReplaySource } from './lib/matchSource.js'
import { groupByOver, preloadAll, loadSnapshot } from './lib/preload.js'
import Header from './components/Header.jsx'
import ViewToggle from './components/ViewToggle.jsx'
import BallStrip from './components/BallStrip.jsx'
import MoodCard from './components/MoodCard.jsx'
import TopTakes from './components/TopTakes.jsx'
import ChatFeed from './components/ChatFeed.jsx'
import Controls from './components/Controls.jsx'
import CatchUpSheet from './components/CatchUpSheet.jsx'

const events = flattenDeliveries(fixture)
const byOver = groupByOver(events)
const lastIdOfOver = new Map([...byOver].map(([over, evs]) => [over, evs[evs.length - 1].id]))
const TICK_MS = 2500

export default function App() {
  const [load, setLoad] = useState({ phase: 'loading', message: 'Connecting to server...' })
  const [chatInfo, setChatInfo] = useState(null)
  const [note, setNote] = useState('')
  const [played, setPlayed] = useState([])
  const [chat, setChat] = useState([])
  const [chatCount, setChatCount] = useState(0)
  const [pulse, setPulse] = useState(null)
  const [done, setDone] = useState([])
  const [lastSeen, setLastSeen] = useState(0)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [lang, setLang] = useState('en')
  const [view, setView] = useState('after')
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)

  const srcRef = useRef(null)
  if (!srcRef.current) srcRef.current = createReplaySource(events, { tickMs: TICK_MS })
  const chatByEvent = useRef(new Map())
  const pulseByOver = useRef(new Map())
  const timers = useRef([])
  const speedRef = useRef(1)
  const keyRef = useRef(0)

  // 1) Load every over's chat and analysis: from the server, or from the offline snapshot
  useEffect(() => {
    let cancelled = false
    const forceSnapshot = new URLSearchParams(window.location.search).has('snapshot')
    const fromServer = () =>
      preloadAll(byOver, (message) => {
        if (!cancelled) setLoad({ phase: 'loading', message })
      }).then((result) => ({ result, origin: 'server' }))
    const fromSnapshot = () =>
      loadSnapshot(byOver).then(({ result, createdAt }) => ({ result, origin: 'snapshot', createdAt }))

    const run = forceSnapshot ? fromSnapshot() : fromServer().catch((e) => fromSnapshot().catch(() => { throw e }))

    run
      .then((out) => {
        if (cancelled) return
        const chatMap = new Map()
        const pulseMap = new Map()
        const chatSources = []
        for (const [over, { chat: c, pulse: p }] of out.result) {
          const overEvents = byOver.get(over)
          chatSources.push(c.source)
          for (const m of c.messages) {
            const ev = overEvents[m.ball]
            if (!ev) continue
            if (!chatMap.has(ev.id)) chatMap.set(ev.id, [])
            chatMap.get(ev.id).push(m)
          }
          pulseMap.set(over, { ...p.pulse, source: p.source, over })
        }
        chatByEvent.current = chatMap
        pulseByOver.current = pulseMap
        setChatInfo({ anyFallback: chatSources.some((s) => s === 'fallback') })
        if (out.origin === 'snapshot') {
          setNote(`Offline snapshot from ${new Date(out.createdAt).toLocaleString()}. No server needed.`)
        }
        setLoad({ phase: 'ready' })
      })
      .catch((e) => {
        if (!cancelled) setLoad({ phase: 'error', message: e.message })
      })
    return () => { cancelled = true }
  }, [])

  // 2) Subscribe to the replay: each ball schedules its chat; the last ball of an over updates the pulse
  useEffect(() => {
    const src = srcRef.current
    const off = src.subscribe((ev) => {
      setPlayed((p) => [...p, ev])
      for (const m of chatByEvent.current.get(ev.id) ?? []) {
        const t = setTimeout(() => {
          const entry = { ...m, key: keyRef.current++ }
          setChat((c) => [...c, entry].slice(-80))
          setChatCount((n) => n + 1)
        }, m.offsetMs / speedRef.current)
        timers.current.push(t)
      }
      if (lastIdOfOver.get(ev.over) === ev.id) {
        const p = pulseByOver.current.get(ev.over)
        if (p) {
          const t = setTimeout(() => {
            setPulse(p)
            setDone((d) => (d.some((x) => x.over === p.over) ? d : [...d, p]))
          }, 2200 / speedRef.current)
          timers.current.push(t)
        }
      }
      const st = src.getState()
      if (st.cursor >= st.total) setPlaying(false)
    })
    return () => {
      off()
      src.pause()
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
  }, [])

  const resetAll = () => {
    srcRef.current.reset()
    timers.current.forEach(clearTimeout)
    timers.current = []
    setPlayed([])
    setChat([])
    setChatCount(0)
    setPulse(null)
    setDone([])
    setLastSeen(0)
    setSheetOpen(false)
    setPlaying(false)
  }

  const togglePlay = () => {
    const src = srcRef.current
    if (playing) {
      src.pause()
      setPlaying(false)
      return
    }
    const st = src.getState()
    if (st.cursor >= st.total) resetAll()
    src.play()
    setPlaying(true)
  }

  const changeSpeed = (x) => {
    setSpeed(x)
    speedRef.current = x
    srcRef.current.setSpeed(x)
  }

  const closeSheet = () => {
    setSheetOpen(false)
    setLastSeen(done.reduce((m, p) => Math.max(m, p.over), 0))
  }

  const doneOvers = new Set(done.map((p) => p.over))
  const unseen = done.filter((p) => p.over > lastSeen)
  const live = played.filter((e) => !doneOvers.has(e.over))

  if (load.phase !== 'ready') {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-3 bg-slate-950 px-6 text-center text-slate-100">
        <h1 className="text-2xl font-bold">Room Pulse</h1>
        {load.phase === 'loading' ? (
          <p className="text-sm text-slate-400">{load.message}</p>
        ) : (
          <p className="text-sm text-red-400">
            Could not reach the server ({load.message}), and no offline snapshot was found. Start the server with
            npm run dev in the server folder, or create a snapshot with node scripts/make-snapshot.js, then reload.
          </p>
        )}
      </div>
    )
  }

  const after = view === 'after'

  return (
    <div className="bg-slate-950 text-slate-100">
      <div className="mx-auto flex h-dvh max-w-md flex-col">
        <Header teams={fixture.meta.teams} last={played[played.length - 1]} lang={lang} onLang={setLang} note={note} />
        <ViewToggle view={view} onView={setView} />
        <BallStrip balls={played.slice(-6)} />
        {after ? (
          <>
            <MoodCard pulse={pulse} lang={lang} />
            <TopTakes pulse={pulse} />
            <button
              onClick={() => setSheetOpen(true)}
              className="mx-4 my-2 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2 text-sm font-semibold hover:bg-indigo-500"
            >
              Catch me up
              {unseen.length > 0 && (
                <span className="rounded-full bg-white px-2 text-xs text-indigo-700">{unseen.length} new</span>
              )}
            </button>
          </>
        ) : (
          <p className="border-b border-slate-800 px-4 py-2 text-xs text-slate-400">
            This is what a fan sees today: a stream of lakhs of messages. Can you tell what the room feels?
          </p>
        )}
        <ChatFeed messages={chat} info={chatInfo} count={chatCount} />
        <Controls
          playing={playing}
          speed={speed}
          onToggle={togglePlay}
          onReset={resetAll}
          onSpeed={changeSpeed}
        />
      </div>
      <CatchUpSheet open={sheetOpen} onClose={closeSheet} unseen={unseen} live={live} lang={lang} />
    </div>
  )
}