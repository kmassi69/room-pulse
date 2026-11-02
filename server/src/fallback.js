const POOLS = {
  six: ['SIXERRR 🔥🔥', 'kya shot hai bhai!!', 'OUT OF THE PARK 💥', '{batter} ne toh udaa diya', 'mazaa aa gaya'],
  four: ['chaar!! 🏏', 'timing dekho yaar', 'gap mil gaya', 'shabaash 👏'],
  wicket: ['OUT!! 😱', 'kya kar raha tha ye', 'wicket gaya, ab dhyaan se', '{batter} jaa raha hai, bye bye', 'rip 💀'],
  dot: ['dot ball 😤', 'rotate the strike yaar', 'bowler on fire', 'kuch toh maar bhai'],
  single: ['ek run, chalo', 'smart cricket', 'strike rotate 👍'],
  wide: ['wide?? seriously', 'free run de diya', 'line pe bowl karo yaar'],
}

const USERS = ['rohit_fan45', 'chai_n_cricket', 'priya.k', 'mumbaikar07', 'dhoni_forever', 'gully_boy99', 'neha_s', 'sixer_king']

export function fallbackChat(events) {
  const out = []
  let i = 0
  events.forEach((ev, ball) => {
    const kind = ev.wicket ? 'wicket'
      : ev.extras?.wides ? 'wide'
      : ev.runs >= 6 ? 'six'
      : ev.runs >= 4 ? 'four'
      : ev.runs === 0 ? 'dot' : 'single'
    const pool = POOLS[kind]
    for (let k = 0; k < 4; k++) {
      out.push({
        user: USERS[i % USERS.length],
        text: pool[(ball + k) % pool.length].replace('{batter}', ev.batter ?? 'batter'),
        ball,
        offsetMs: k * 500,
      })
      i++
    }
  })
  return out
}