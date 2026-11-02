import { fixture } from '../../client/src/data/fixture.js'
import { flattenDeliveries } from '../../client/src/lib/matchSource.js'

const BASE = 'http://localhost:3001/api'
const over = Number(process.argv[2] || 2)
const events = flattenDeliveries(fixture).filter((e) => e.over === over)
const post = async (path, body) =>
  (await fetch(BASE + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })).json()

const chat = await post('/chat/simulate', { events })
console.log('chat  ->', chat.source, chat.cached ? '(cached)' : '', `${chat.messages?.length} messages`)

// Space LLM calls so the free-tier token cap is not hit
if (chat.source === 'llm' && !chat.cached) {
  console.log('waiting 25s to stay under the token cap...')
  await new Promise((r) => setTimeout(r, 25000))
}

const out = await post('/pulse/analyze', { events, messages: chat.messages })
console.log('pulse ->', out.source, out.cached ? '(cached)' : '', '|', out.model ?? '-')
if (out.fallbackReason) console.log('fallbackReason:', out.fallbackReason)
const p = out.pulse
console.log(`mood: ${p.mood} (${p.moodScore}/100)`)
console.log('summary en      :', p.summary.en)
console.log('summary hinglish:', p.summary.hinglish)
console.log('catchUp en      :', p.catchUp.en)
console.log('catchUp hinglish:', p.catchUp.hinglish)
p.topTakes.forEach((t, i) => console.log(`top take ${i + 1}: ${t.user}: ${t.text}  [why: ${t.why}]`))