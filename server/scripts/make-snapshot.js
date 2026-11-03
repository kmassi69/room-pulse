import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { fixture } from '../../client/src/data/fixture.js'
import { flattenDeliveries } from '../../client/src/lib/matchSource.js'

const BASE = 'http://localhost:3001/api'
const SPACING_MS = 25000
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const post = async (p, body) =>
  (await fetch(BASE + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })).json()

const health = await (await fetch(BASE + '/health')).json()
if (health.provider === 'mock') {
  console.error('Server is in mock mode. Start it with LLM_PROVIDER=groq so the snapshot holds real AI output.')
  process.exit(1)
}

const events = flattenDeliveries(fixture)
const overs = [...new Set(events.map((e) => e.over))]
let lastFresh = 0

async function spaced(call) {
  const wait = lastFresh + SPACING_MS - Date.now()
  if (wait > 0) {
    console.log(`  waiting ${Math.ceil(wait / 1000)}s (token cap)...`)
    await sleep(wait)
  }
  const data = await call()
  if (data.source === 'llm' && !data.cached) lastFresh = Date.now()
  return data
}

const out = []
for (const over of overs) {
  const evs = events.filter((e) => e.over === over)
  console.log(`over ${over}: simulating chat...`)
  const chat = await spaced(() => post('/chat/simulate', { events: evs }))
  if (chat.source !== 'llm') {
    console.error(`Chat for over ${over} used the fallback (${chat.fallbackReason}). Fix that and run again.`)
    process.exit(1)
  }
  console.log(`over ${over}: analysing the room...`)
  const pulse = await spaced(() => post('/pulse/analyze', { events: evs, messages: chat.messages }))
  if (pulse.source !== 'llm') {
    console.error(`Analysis for over ${over} used the fallback (${pulse.fallbackReason}). Fix that and run again.`)
    process.exit(1)
  }
  out.push({
    over,
    chat: { source: chat.source, label: chat.label, messages: chat.messages },
    pulse: { source: pulse.source, label: pulse.label, pulse: pulse.pulse },
  })
}

const here = path.dirname(fileURLToPath(import.meta.url))
const dest = path.resolve(here, '../../client/public/snapshot.json')
mkdirSync(path.dirname(dest), { recursive: true })
writeFileSync(
  dest,
  JSON.stringify({ createdAt: new Date().toISOString(), provider: health.provider, model: health.model, overs: out }, null, 2)
)
console.log(`Saved ${out.length} overs to ${dest}`)