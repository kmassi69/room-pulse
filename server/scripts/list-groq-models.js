import 'dotenv/config'

const res = await fetch('https://api.groq.com/openai/v1/models', {
  headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
})
if (!res.ok) {
  console.error(res.status, await res.text())
  process.exit(1)
}
const { data } = await res.json()
data.map((m) => m.id).sort().forEach((id) => console.log(id))