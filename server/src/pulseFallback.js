const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n))

export function moodFromScore(score) {
  if (score >= 75) return 'hyped'
  if (score >= 60) return 'upbeat'
  if (score >= 40) return 'mixed'
  if (score >= 25) return 'tense'
  return 'gloomy'
}

export function fallbackPulse(events, messages) {
  const wickets = events.filter((e) => e.wicket).length
  const sixes = events.filter((e) => !e.wicket && e.runs >= 6).length
  const fours = events.filter((e) => !e.wicket && e.runs >= 4 && e.runs < 6).length
  const runs = events.reduce((a, e) => a + (e.runs ?? 0), 0)
  const moodScore = clamp(50 + sixes * 14 + fours * 8 - wickets * 22, 5, 95)
  const mood = moodFromScore(moodScore)
  const last = events[events.length - 1]
  const scoreTxt = last?.score ? `${last.score.runs}/${last.score.wickets}` : ''
  const wkEn = wickets ? `, ${wickets} wicket${wickets > 1 ? 's' : ''}` : ''
  const wkHi = wickets ? `, ${wickets} wicket` : ''

  const weight = (ball) => {
    const e = events[ball]
    if (!e) return 1
    return e.wicket ? 3 : e.runs >= 6 ? 3 : e.runs >= 4 ? 2 : 1
  }
  const ranked = messages
    .map((m) => ({ ...m, s: weight(m.ball) * 10 + m.text.length }))
    .sort((a, b) => b.s - a.s)
  const seen = new Set()
  const topTakes = []
  for (const m of ranked) {
    if (seen.has(m.user)) continue
    seen.add(m.user)
    topTakes.push({ user: m.user, text: m.text, ball: m.ball, why: 'Picked by rules (fallback)' })
    if (topTakes.length === 3) break
  }

  return {
    mood,
    moodScore,
    summary: {
      en: `${runs} runs${wkEn} this over. The room feels ${mood}.`,
      hinglish: `Is over mein ${runs} run${wkHi}. Room ka mood: ${mood}.`,
    },
    topTakes,
    catchUp: {
      en: `Over ${events[0]?.over ?? '?'}: ${runs} runs${wkEn}. Score ${scoreTxt}. The room is ${mood}.`,
      hinglish: `Over ${events[0]?.over ?? '?'}: ${runs} run${wkHi}. Score ${scoreTxt}. Room ka mood ${mood}.`,
    },
  }
}