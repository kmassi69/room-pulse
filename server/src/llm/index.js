import { createGroqProvider } from './groq.js'

const mock = {
  name: 'mock',
  model: null,
  async completeJson() {
    throw new Error('mock provider: no LLM configured')
  },
}

export function getProvider() {
  const which = (process.env.LLM_PROVIDER || 'mock').toLowerCase()
  if (which === 'groq') {
    try {
      return createGroqProvider({ apiKey: process.env.GROQ_API_KEY, model: process.env.GROQ_MODEL })
    } catch (e) {
      console.warn(`[llm] ${e.message}. Using mock (fallback chat only).`)
    }
  }
  return mock
}