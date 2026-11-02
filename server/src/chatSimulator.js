import { fallbackChat } from './fallback.js'

const SYSTEM = `You simulate the live chat of lakhs of fans watching a cricket match in an Indian second-screen app. It must feel like a real, messy, fast crowd, NOT commentary.

Write 25 to 30 messages reacting to the balls given.
Distribution: wickets, sixes and fours get MANY messages (6 to 10 each, from different fans, some arguing with each other). Dot balls and singles get only 0 to 2 messages. Wides get 1 or 2 irritated ones. Do NOT write one message per ball in order.
Voice: Hinglish in Roman script mixed with English, like real fans texting. Mostly lowercase, short (2 to 10 words), some typos and stretched words ("sixxxx", "kyaaa"), emojis on only about half the messages. Mix hype, panic, trolling the batter or bowler, jokes, "maine bola tha" predictions, and a couple of off-topic or noisy lines (chai, exams, wifi). Mild trolling only.
Usernames: realistic handles like "rahul_0412", "mumbai_ka_raja", "dhoni_fan7", "priya.sharma", "xX_cric_Xx". Never name a username after the action (no "sixer_sultan", no "wicketwatcher"). Every username is different.
Facts: use only the player names given in the input. Never invent fielders, catchers or stats. Do not quote the score in most messages.
Safety: no slurs, hate speech, profanity, abuse of real people, or personal info.
Return ONLY a JSON object, no other text, in exactly this shape:
{"messages":[{"user":"string","text":"string","ball":0,"offsetMs":0}]}
"ball" is the index of the ball the message reacts to (as numbered in the input). "offsetMs" is 0 to 2000, spread out so reactions arrive at different times.`

const cache = new Map()

function describe(ev, i) {
  const what = ev.wicket
    ? `WICKET, ${ev.batter ?? 'batter'} is out (${ev.wicket.kind ?? 'out'})`
    : ev.extras?.wides ? 'wide'
    : ev.runs === 0 ? 'dot ball'
    : `${ev.runs} run${ev.runs === 1 ? '' : 's'}`
  const s = ev.score ? ` | score ${ev.score.runs}/${ev.score.wickets} after ${ev.score.overs} overs` : ''
  return `${i}: ${ev.batter ?? '?'} vs ${ev.bowler ?? '?'} - ${what}${s}`
}

function clean(raw, nBalls) {
  const arr = Array.isArray(raw) ? raw : raw?.messages
  if (!Array.isArray(arr)) throw new Error('messages array missing')
  const out = arr
    .filter((m) => m && typeof m.text === 'string' && m.text.trim())
    .slice(0, 60)
    .map((m) => ({
      user: String(m.user || 'fan').slice(0, 24),
      text: m.text.trim().slice(0, 160),
      ball: Number.isInteger(m.ball) ? Math.min(Math.max(m.ball, 0), nBalls - 1) : 0,
      offsetMs: Number.isFinite(m.offsetMs) ? Math.min(Math.max(m.offsetMs, 0), 2000) : 0,
    }))
    .sort((a, b) => a.ball - b.ball || a.offsetMs - b.offsetMs)
  if (out.length < 5) throw new Error('too few valid messages')
  return out
}

export async function simulateChat(events, provider) {
  const key = JSON.stringify(events)
  if (cache.has(key)) return { ...cache.get(key), cached: true }

  try {
    const user = `Balls this over:\n${events.map(describe).join('\n')}`
    const raw = await provider.completeJson({ system: SYSTEM, user })
    const result = {
      source: 'llm',
      label: 'Simulated chat',
      provider: provider.name,
      model: provider.model,
      messages: clean(raw, events.length),
    }
    cache.set(key, result)
    return result
  } catch (e) {
    return {
      source: 'fallback',
      label: 'Simulated chat',
      provider: provider.name,
      fallbackReason: e.message,
      messages: fallbackChat(events),
    }
  }
}