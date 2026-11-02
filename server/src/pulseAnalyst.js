import { fallbackPulse, moodFromScore } from './pulseFallback.js'

const MOODS = ['hyped', 'upbeat', 'mixed', 'tense', 'gloomy']

const SYSTEM = `You are the analyst behind "Room Pulse", an AI layer on a cricket watch-along app. You read one over of match events and the fan chat from that over, then summarise the room.
Return ONLY a JSON object, no other text, in exactly this shape:
{"mood":"hyped|upbeat|mixed|tense|gloomy","moodScore":0,"summary":{"en":"","hinglish":""},"topTakes":[{"id":0,"why":""}],"catchUp":{"en":"","hinglish":""}}
Rules:
- moodScore is 0 to 100 (0 = gloomy, 100 = euphoric) and must match "mood".
- summary: ONE sentence, under 20 words, about what the room feels and why. No usernames.
- topTakes: exactly 3 chat message ids (the number at the start of each chat line) that are the funniest, sharpest or most representative of the room. Pick different users. "why" is under 10 words.
- catchUp: 2 short sentences for a fan who looked away. First what happened in the match, then how the room reacted.
- "en" is English. "hinglish" is Hindi in Roman script mixed with English, casual tone.
- Use only facts present in the input. Never invent fielders, catchers, stats or scores.`

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

const str = (v) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, 300) : null)

function clean(raw, messages) {
  if (!raw || typeof raw !== 'object') throw new Error('analysis is not an object')
  const score = Number(raw.moodScore)
  if (!Number.isFinite(score)) throw new Error('moodScore missing')
  const moodScore = Math.min(100, Math.max(0, Math.round(score)))
  const mood = MOODS.includes(raw.mood) ? raw.mood : moodFromScore(moodScore)

  const summary = { en: str(raw.summary?.en), hinglish: str(raw.summary?.hinglish) }
  const catchUp = { en: str(raw.catchUp?.en), hinglish: str(raw.catchUp?.hinglish) }
  if (!summary.en || !summary.hinglish) throw new Error('summary missing')
  if (!catchUp.en || !catchUp.hinglish) throw new Error('catchUp missing')

  const seen = new Set()
  const topTakes = []
  for (const t of Array.isArray(raw.topTakes) ? raw.topTakes : []) {
    const m = Number.isInteger(t?.id) ? messages[t.id] : null
    if (!m || seen.has(m.user)) continue
    seen.add(m.user)
    topTakes.push({ user: m.user, text: m.text, ball: m.ball, why: str(t.why) ?? '' })
    if (topTakes.length === 3) break
  }
  if (topTakes.length === 0) throw new Error('no valid topTakes')

  return { mood, moodScore, summary, topTakes, catchUp }
}

export async function analyzePulse(events, messages, provider) {
  const key = JSON.stringify({ events, messages })
  if (cache.has(key)) return { ...cache.get(key), cached: true }

  try {
    const user =
      `Balls this over:\n${events.map(describe).join('\n')}\n\n` +
      `Fan chat:\n${messages.map((m, i) => `${i} (ball ${m.ball}) ${m.user}: ${m.text}`).join('\n')}`
    const raw = await provider.completeJson({ system: SYSTEM, user, maxTokens: 2000, temperature: 0.4 })
    const result = {
      source: 'llm',
      label: 'AI analysis of simulated chat',
      provider: provider.name,
      model: provider.model,
      pulse: clean(raw, messages),
    }
    cache.set(key, result)
    return result
  } catch (e) {
    return {
      source: 'fallback',
      label: 'Rule-based analysis of simulated chat',
      provider: provider.name,
      fallbackReason: e.message,
      pulse: fallbackPulse(events, messages),
    }
  }
}