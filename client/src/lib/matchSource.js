/**
 * MatchSource interface (the integration seam):
 *   subscribe(cb) -> unsubscribe   cb receives each ball event
 *   play() / pause() / reset() / setSpeed(x) / getState()
 * v1 = replay of a fixture. Production = Dream11's live feed, same interface.
 */

export function flattenDeliveries(fixture) {
  const events = []
  let runs = 0, wickets = 0, legal = 0
  fixture.innings.forEach((inn, innings) => {
    inn.overs.forEach((ov) => {
      ov.deliveries.forEach((dl) => {
        const isLegal = !(dl.extras?.wides || dl.extras?.noballs)
        runs += dl.runs.total
        wickets += dl.wickets?.length ?? 0
        if (isLegal) legal += 1
        events.push({
          id: events.length, innings, team: inn.team,
          over: ov.over + 1,               // human-friendly, 1-indexed
          batter: dl.batter, bowler: dl.bowler,
          runs: dl.runs.total, batterRuns: dl.runs.batter,
          extras: dl.extras ?? null, wicket: dl.wickets?.[0] ?? null,
          isLegal,
          score: { runs, wickets, overs: `${Math.floor(legal / 6)}.${legal % 6}` },
        })
      })
    })
  })
  return events
}

export function createReplaySource(events, { tickMs = 2500 } = {}) {
  let cursor = 0, timer = null, speed = 1
  const listeners = new Set()

  const step = () => {
    if (cursor >= events.length) return pause()
    const ev = events[cursor++]
    listeners.forEach((cb) => cb(ev))
  }
  const play = () => { if (!timer) timer = setInterval(step, tickMs / speed) }
  const pause = () => { clearInterval(timer); timer = null }
  const reset = () => { pause(); cursor = 0 }
  const setSpeed = (x) => { speed = x; if (timer) { pause(); play() } }

  return {
    subscribe(cb) { listeners.add(cb); return () => listeners.delete(cb) },
    play, pause, reset, setSpeed,
    getState: () => ({ cursor, total: events.length, playing: !!timer, speed }),
  }
}