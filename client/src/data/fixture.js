const d = (batter, bowler, runs, { extras = {}, wicket = null } = {}) => {
  const extraRuns = Object.values(extras).reduce((a, b) => a + b, 0)
  return {
    batter, bowler, non_striker: 'K. Mehta',
    runs: { batter: runs, extras: extraRuns, total: runs + extraRuns },
    ...(Object.keys(extras).length && { extras }),
    ...(wicket && { wickets: [{ player_out: batter, kind: wicket }] }),
  }
}

export const fixture = {
  meta: { teams: ['Blue XI', 'Gold XI'], format: 'T20', source: 'hand-written sample (Cricsheet-like schema)' },
  innings: [{
    team: 'Blue XI',
    overs: [
      { over: 0, deliveries: [
        d('A. Rao', 'R. Singh', 0), d('A. Rao', 'R. Singh', 4), d('A. Rao', 'R. Singh', 1),
        d('K. Mehta', 'R. Singh', 0), d('K. Mehta', 'R. Singh', 6), d('K. Mehta', 'R. Singh', 1),
      ]},
      { over: 1, deliveries: [
        d('A. Rao', 'T. Khan', 1), d('K. Mehta', 'T. Khan', 0, { wicket: 'caught' }),
        d('S. Iyer', 'T. Khan', 0), d('S. Iyer', 'T. Khan', 4),
        d('S. Iyer', 'T. Khan', 0, { extras: { wides: 1 } }),
        d('S. Iyer', 'T. Khan', 6), d('S. Iyer', 'T. Khan', 2),
      ]},
    ],
  }],
}