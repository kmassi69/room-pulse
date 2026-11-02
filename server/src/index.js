import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { getProvider } from './llm/index.js'
import { simulateChat } from './chatSimulator.js'
import { analyzePulse } from './pulseAnalyst.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

const provider = getProvider()

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, provider: provider.name, model: provider.model })
})

app.post('/api/chat/simulate', async (req, res) => {
  const { events } = req.body ?? {}
  if (!Array.isArray(events) || events.length === 0) {
    return res.status(400).json({ error: 'events array required' })
  }
  res.json(await simulateChat(events, provider))
})

app.post('/api/pulse/analyze', async (req, res) => {
  const { events, messages } = req.body ?? {}
  if (!Array.isArray(events) || events.length === 0 || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'events and messages arrays required' })
  }
  res.json(await analyzePulse(events, messages, provider))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Room Pulse server on http://localhost:${PORT} (provider: ${provider.name})`))