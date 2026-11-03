import { simulateChat, analyzePulse } from './api.js'

const SPACING_MS = 25000
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export function groupByOver(events) {
  const map = new Map()
  events.forEach((e) => {
    if (!map.has(e.over)) map.set(e.over, [])
    map.get(e.over).push(e)
  })
  return map
}

// Module-level so React StrictMode's double mount does not fire the calls twice.
let promise = null
let listener = null
let lastFreshAt = 0

// Keeps fresh LLM calls at least SPACING_MS apart (free-tier token cap).
async function throttled(call) {
  const wait = lastFreshAt + SPACING_MS - Date.now()
  if (wait > 0) {
    listener?.(`Pausing ${Math.ceil(wait / 1000)}s to stay under the free-tier token cap...`)
    await sleep(wait)
  }
  const data = await call()
  if (data.source === 'llm' && !data.cached) lastFreshAt = Date.now()
  return data
}

export function preloadAll(byOver, onProgress) {
  listener = onProgress
  if (!promise) {
    promise = run(byOver).catch((e) => {
      promise = null
      throw e
    })
  }
  return promise
}

async function run(byOver) {
  const out = new Map()
  const overs = [...byOver.keys()]
  for (const over of overs) {
    const events = byOver.get(over)
    listener?.(`Over ${over} of ${overs.length}: generating simulated chat...`)
    const chat = await throttled(() => simulateChat(events))
    listener?.(`Over ${over} of ${overs.length}: analysing the room...`)
    const pulse = await throttled(() => analyzePulse(events, chat.messages))
    out.set(over, { chat, pulse })
  }
  return out
}

// Offline snapshot written by server/scripts/make-snapshot.js
export async function loadSnapshot(byOver) {
  const res = await fetch('/snapshot.json', { cache: 'no-store' })
  if (!res.ok) throw new Error('No offline snapshot found')
  let data
  try {
    data = await res.json()
  } catch {
    throw new Error('No offline snapshot found')
  }
  const result = new Map()
  for (const over of byOver.keys()) {
    const entry = data.overs?.find((o) => o.over === over)
    if (!entry?.chat?.messages?.length || !entry?.pulse?.pulse) throw new Error(`Snapshot is missing over ${over}`)
    result.set(over, { chat: entry.chat, pulse: entry.pulse })
  }
  return { result, createdAt: data.createdAt }
}