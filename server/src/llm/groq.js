import { parseJsonLoose } from './json.js'

const URL = 'https://api.groq.com/openai/v1/chat/completions'

export function createGroqProvider({ apiKey, model }) {
  if (!apiKey) throw new Error('GROQ_API_KEY missing in server/.env')
  if (!model) throw new Error('GROQ_MODEL missing in server/.env')

  async function call(body) {
    const res = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    })
    if (!res.ok) {
      const err = new Error(`Groq HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`)
      err.status = res.status
      throw err
    }
    const data = await res.json()
    return data.choices?.[0]?.message?.content ?? ''
  }

  return {
    name: 'groq',
    model,
    // Returns parsed JSON (object). Retries once on bad JSON.
    async completeJson({ system, user, maxTokens = 3000, temperature = 0.9 }) {
      const body = {
        model,
        temperature,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }
      let useJsonMode = true
      let lastErr
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const text = await call(useJsonMode ? { ...body, response_format: { type: 'json_object' } } : body)
          return parseJsonLoose(text)
        } catch (e) {
          lastErr = e
          if (e.status === 400 && useJsonMode) { useJsonMode = false; attempt--; continue } // model may not support JSON mode
          if (e.status) throw e // real HTTP errors (401, 404, 429...) are not worth a retry
        }
      }
      throw lastErr
    },
  }
}