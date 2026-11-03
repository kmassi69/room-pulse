# Room Pulse

An AI layer for Dream11 watch-alongs. It helps a fan who is lost in a huge, fast chat understand what the room feels, catch up after looking away, and get noticed without paying for a Shout Out.

> **Honest labels.** This prototype replays a **hand-written sample match with fictional teams (Blue XI vs Gold XI, 2 overs)** and uses **AI-simulated crowd chat**. It has no access to real Dream11 chat or live match data. Both are labelled in the UI ("Replay", "Simulated chat").

## The problem

In a creator-led watch-along with a very large crowd:

1. **Chat is an unreadable firehose.** A fan cannot tell what the room feels or what just happened.
2. **Looking away means being lost.** There is no quick way to catch up on the match and the room's reaction.
3. **A fan's voice disappears.** Getting noticed costs DreamBucks (Shout Outs, pinned chats), so most fans are never acknowledged.

Status of the evidence: that watch-alongs are the core product, and that recognition is paid, is confirmed by Dream11's own materials. That chat overload is a top fan complaint is a **hypothesis**, and the pilot below is designed to test it.

## What it does

| Feature | What the fan sees |
|---|---|
| **Room Mood** | A mood label, a 0-100 score bar and a one-line summary, refreshed at the end of every over |
| **Top Takes** | The best fan messages of the over, picked by AI and shown to the room for free |
| **Catch Me Up** | A short recap of what happened and how the room reacted, for the overs the fan has not seen yet |
| **English / Hinglish** | Summaries and recaps switch language instantly (Hindi is a later option) |
| **Before / After toggle** | Flip between the raw chat firehose and the Room Pulse view, to make the value obvious |

## Architecture

```
 client (Vite + React + Tailwind)              server (Express)               Groq (free tier)
 ┌──────────────────────────────┐   /api    ┌───────────────────────┐  JSON  ┌──────────────┐
 │ replay engine  (MatchSource) │──────────▶│ POST /api/chat/simulate│───────▶│ crowd chat   │
 │ UI: mood, top takes, catch-up│           │ POST /api/pulse/analyze│───────▶│ room analyst │
 │ offline snapshot fallback    │◀──────────│ GET  /api/health       │        └──────────────┘
 └──────────────────────────────┘           │ LlmProvider (swappable)│
                                            │ rule-based fallbacks   │
                                            └───────────────────────┘
```

### The integration seams (what changes in production)

| Seam | In this prototype | In production |
|---|---|---|
| **MatchSource** (`client/src/lib/matchSource.js`) | Replays a fixture ball by ball: `subscribe`, `play`, `pause`, `reset`, `setSpeed`, `getState` | Dream11's live match feed behind the same interface |
| **Chat** (`POST /api/chat/simulate` contract) | An LLM invents crowd chat for each over | The real chat stream feeds the analyst instead, and the simulator is not used |
| **LlmProvider** (`server/src/llm/`) | Groq free tier, model `openai/gpt-oss-120b`, behind `completeJson({system, user})` | Any provider, such as a Dream11-approved model, by changing one file and `LLM_PROVIDER` |

The Room Pulse analyst logic (`server/src/pulseAnalyst.js`) and the UI do not change when these are swapped.

### Reliability: three layers, so a demo does not break

1. **Live AI.** The server calls Groq. Results are cached per over and the client spaces its calls 25 seconds apart to stay under the free-tier token cap.
2. **Rule-based fallback.** On any error (rate limit, bad JSON, no key), the server returns canned chat and a rule-based mood, summary and top takes. Mood score = 50 + sixes x 14 + fours x 8 - wickets x 22, clamped to 5-95.
3. **Offline snapshot.** `client/public/snapshot.json` holds a pre-generated AI run. If the server is unreachable, the client loads it automatically. Add `?snapshot` to the URL to force it.

The model returns **message ids only** for Top Takes. The server copies the real text from the chat, so a Top Take can never be invented.

## Run it (Windows PowerShell)

Requirements: Node 20 or later (built on Node v24), and a free Groq API key from console.groq.com.

```powershell
# 1. install
cd room-pulse\client
npm install
cd ..\server
npm install
```

Create `server\.env` (it is git-ignored, never commit it):

```
PORT=3001
LLM_PROVIDER=groq
GROQ_API_KEY=your_key_here
GROQ_MODEL=openai/gpt-oss-120b
```

Set `LLM_PROVIDER=mock` to force the rule-based fallback with no AI. Editing `.env` needs a server restart.

```powershell
# 2. run (two terminals, both stay open)
cd room-pulse\server ; npm run dev     # http://localhost:3001
cd room-pulse\client ; npm run dev     # http://localhost:5173 (Vite prints the port)
```

The first load calls the AI 4 times (chat and analysis for 2 overs, 25 seconds apart) and takes about 1.5 minutes. Later loads are near-instant while the server keeps its in-memory cache.

### Before any demo: create the snapshot

```powershell
cd room-pulse\server
node scripts/make-snapshot.js          # needs the server running on Groq; about 10K tokens once
```

Then open `http://localhost:5173/?snapshot`. It loads instantly with no AI calls.

### Useful scripts

| Command (from `server`) | What it does |
|---|---|
| `node scripts/list-groq-models.js` | Lists the model ids your key can use |
| `node scripts/test-chat.js 2` | Simulates chat for over 2 |
| `node scripts/test-pulse.js 2` | Simulates chat, then runs the analyst, for over 2 |
| `node scripts/make-snapshot.js` | Writes `client/public/snapshot.json` |

From `client`: `node scripts/smoke-replay.js` replays the fixture in the terminal. It should end with `2.0  S. Iyer 2  26/1`.

## Project structure

```
room-pulse/
├─ README.md, PITCH.md
├─ client/
│  ├─ public/snapshot.json          offline AI snapshot
│  ├─ scripts/smoke-replay.js
│  └─ src/
│     ├─ App.jsx                    main screen and state
│     ├─ data/fixture.js            hand-written 2-over match
│     ├─ lib/matchSource.js         replay engine (MatchSource)
│     ├─ lib/api.js, preload.js     server calls, throttling, snapshot loader
│     └─ components/                Header, ViewToggle, BallStrip, MoodCard,
│                                   TopTakes, ChatFeed, Controls, CatchUpSheet
└─ server/
   ├─ scripts/                      test-chat, test-pulse, make-snapshot, list-groq-models
   └─ src/
      ├─ index.js                   routes
      ├─ chatSimulator.js, fallback.js
      ├─ pulseAnalyst.js, pulseFallback.js
      └─ llm/                       index.js (provider switch), groq.js, json.js
```

## Limitations (stated plainly)

- The match is a 2-over fictional fixture, and the chat is simulated. The prototype shows the **experience and the plumbing**, not real-world accuracy.
- The simulated chat is more generic than a real room, so Top Takes and the mood score are less sharp than they would be on real chat. The mood score can run high after an over with a wicket.
- Hindi is not built. Moderation, toxicity filtering and a creator view are not built.
- The Groq free-tier limits change. The console currently shows a limit line of 30 requests per minute and about 8K tokens for the 120b model (the unit of the token limit and the daily cap are unverified). Re-check before relying on them.
- The server cache is in memory and clears on restart.
- Cost and latency at real scale (lakhs of messages per match) are **not measured**. They are a pilot question.

## What a pilot needs from Dream11

1. A read-only copy of the live chat stream for one watch-along, plus the match event feed.
2. Chat volume numbers: median messages per minute in a large room, and the share of viewers who read chat versus scroll past it.
3. Drop-off and return data: how often fans leave a room mid-match and when they come back.
4. The share of fans who ever receive a Shout Out or pin, and which languages dominate chat.
5. Agreement on privacy and moderation rules for processing chat text.

## Proposed pilot

An A/B test on one match: half the viewers see Room Pulse, half do not.

| Metric | Why it matters |
|---|---|
| Time to understand what is happening in the room | The core promise: a few seconds instead of reading chat |
| Catch Me Up usage and return-to-room rate after absence | Does the recap win fans back? |
| Share of active fans whose message becomes a Top Take | Recognition reach, without paid Shout Outs |
| Session length and reactions per user versus control | Engagement and retention |

## Risks

| Risk | Mitigation |
|---|---|
| AI latency or errors during a live match | Pre-generate and cache; rule-based fallback; offline snapshot |
| Free-tier rate limits | Spaced calls, per-over caching, swappable provider |
| Summaries that misread a Hinglish room | A human-checked evaluation set from real chat, scored before the pilot |
| Privacy of chat text | Process in Dream11's environment under their rules; this prototype uses no real user data |
| Key leakage | Keys only in `server/.env`, git-ignored, never in client code |
