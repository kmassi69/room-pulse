import { fixture } from '../../client/src/data/fixture.js'
import { flattenDeliveries } from '../../client/src/lib/matchSource.js'

const over = Number(process.argv[2] || 2)
const events = flattenDeliveries(fixture).filter((e) => e.over === over)

const res = await fetch('http://localhost:3001/api/chat/simulate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ events }),
})
const data = await res.json()
console.log('source:', data.source, '| provider:', data.provider, '| model:', data.model ?? '-', '| cached:', !!data.cached)
if (data.fallbackReason) console.log('fallbackReason:', data.fallbackReason)
console.log(`${data.messages?.length} messages for over ${over} (${events.length} balls)`)
data.messages?.forEach((m) => console.log(`[ball ${m.ball}] ${m.user}: ${m.text}`))