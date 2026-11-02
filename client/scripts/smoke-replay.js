import { fixture } from '../src/data/fixture.js'
import { flattenDeliveries, createReplaySource } from '../src/lib/matchSource.js'

const events = flattenDeliveries(fixture)
const src = createReplaySource(events, { tickMs: 200 })
src.subscribe((e) =>
  console.log(`${e.score.overs}  ${e.batter} ${e.wicket ? 'OUT' : e.runs}  ${e.score.runs}/${e.score.wickets}`)
)
src.play()