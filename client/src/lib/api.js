async function post(path, body) {
  const res = await fetch(`/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Server error ${res.status}`)
  return res.json()
}

export const simulateChat = (events) => post('/chat/simulate', { events })
export const analyzePulse = (events, messages) => post('/pulse/analyze', { events, messages })