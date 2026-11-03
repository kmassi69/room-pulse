# Room Pulse: pitch notes and 60-second demo script

## The one-liner

> Dream11 watch-alongs put a fan in a room with a huge crowd. Room Pulse tells that fan what the room feels, what they missed, and which fan voices stood out, in a few seconds and in their own language.

## Positioning (the FDE framing)

I am not pitching a finished product. I am pitching a **pilot**:

1. **Discover:** the user is a casual fan, 18-35, on mobile, chatting in Hinglish. The stakeholder is whoever owns watch-along engagement and retention.
2. **Constrain honestly:** I have no real chat or live feed, so I built on a replayed match and simulated chat, and I say so on screen.
3. **Design the seam:** match feed, chat stream and LLM provider are swappable interfaces. Their real stream plugs in without changing the Room Pulse logic.
4. **Thin vertical slice:** one over, end to end, then two.
5. **Measure:** a one-match A/B test with four named metrics (README, "Proposed pilot").

## Fact check (done 3 Nov 2026, re-verify the day you pitch)

**Supported by current sources:**
- Dream11 (Dream Sports) announced a pivot from real-money gaming to a **second-screen sports entertainment platform** in early December 2025, positioned as a companion to the broadcast, not a replacement.
- The centrepiece is **creator-led watch-alongs** with live chat, reactions and free-to-play fantasy. Reports say 25 creators were onboarded at launch.
- **DreamBucks** is the in-app currency. Fans can earn or buy it and spend it on **Shout Outs and pinned messages**. The App Store listing says it has no cash value and is for entertainment.
- Dream11 says it has over 250 million users (the company's own claim).
- Press coverage names **advertising** as a key near-term revenue driver, and the App Store listing says the app contains advertising.
- India's ban on real-money gaming removed paid cash contests. One outlet reports it eliminated about 95% of Dream11's revenue (treat as reported, not confirmed).

**Not verified in this check. Soften or confirm before you say them:**
- "Lakhs of fans in one room." Say "very large rooms" unless you have a source.
- "80% of fans use a second screen." This came from my earlier notes, and I did not re-confirm it.
- "App store reviews complain the live layer is intrusive." Read recent reviews yourself and quote what you actually see.
- The exact month and name of the 2025 gaming law. Say "the 2025 online gaming law" unless you check.
- Whether Dream11's watch-along features have changed since December 2025. Open the app the week you pitch.

**Hypothesis, not fact:** chat overload is a top fan pain point. Present it as "what I believe, and what I would like your data to confirm."

## 60-second demo script

### Setup (do this before you present)
1. Server running on Groq, and `node scripts/make-snapshot.js` done at least once (snapshot exists).
2. Open `http://localhost:5173/?snapshot` in a **narrow window** (phone width). It loads instantly and uses no AI calls, so it cannot fail on stage.
3. Set the view to **With Room Pulse**, language **English**, and speed **2x**. Press Reset so nothing has played.
4. Rehearse the whole run twice. At 2x, a ball arrives about every 1.25 seconds, over 1 ends about 8 seconds after Play, and the whole replay takes about 17 seconds.
5. Backup: keep this script on a second screen. If something looks wrong, say so and carry on. The honest labels are your safety net.

### The script

| Time | You do | You say |
|---|---|---|
| 0:00 | Show the screen. Point at the **Replay** badge and the fictional-teams line. | "Dream11 is now a second-screen app, and watch-alongs are the centrepiece. The fan sits in a very large room. Before I show you anything: this is a replay of a sample match with simulated chat. I don't have your data, and I'm telling you up front." |
| 0:12 | Tap **Without Room Pulse**, then press **Play**. | "This is the fan's experience today. Watch the chat." |
| 0:15 | Let it run. Point at the message counter. | "A wicket, a four, a six. Can anyone tell me what the room feels right now? A fan can't either. And if they look away for a minute, they're lost." |
| 0:25 | Tap **With Room Pulse** (the replay is still running). | "Now the same match with Room Pulse." |
| 0:28 | Point at the **mood card** (over 1), then swipe the **Top takes**. | "At the end of every over: how the room feels, in one line, plus the best fan messages. Recognised for free. Today that costs DreamBucks, so most fans are never seen." |
| 0:38 | Tap **Catch me up**. Read one recap line. | "I looked away. One tap: what happened, and how the room reacted. The badge shows how many overs I've missed." |
| 0:47 | Close the sheet. Tap **Hinglish**. | "And it speaks the fan's language. Same summary, in Hinglish, instantly." |
| 0:52 | Look at the camera. | "It's built behind three swappable seams: your match feed, your chat stream, and the model. I'd like to run it as an A/B test on one match. I'd need chat volume and drop-off data to prove the problem is real." |
| 1:00 | Stop. | |

If you have 30 seconds extra: open the README's architecture diagram and the fallback layers (live AI, rule-based, offline snapshot). That is the FDE story: "the demo cannot break, and I can tell you why."

## Questions to ask Dream11

1. What share of viewers read chat versus scroll past it? What is the median number of chat messages per minute in a large room?
2. How often do fans leave a room during a match, and when do they come back?
3. What fraction of fans ever receive a Shout Out or a pin?
4. Which languages dominate chat?
5. What are the privacy and moderation rules for processing chat text?

## Likely questions and honest answers

**"Is the chat real?"** No. It's generated by an AI model and labelled "Simulated chat". The point is the pipeline and the experience. With your stream, the analyst reads real messages.

**"Will it work on real Hinglish chat at our scale?"** I don't know yet, and I don't want to guess. In the prototype the model handled simulated Hinglish well enough to summarise. Real chat is noisier. The pilot needs a human-checked sample of real chat to score it before launch.

**"What would it cost at lakhs of messages?"** Not measured. My proposal, which is untested: don't send every message to a large model. Sample or cluster the stream with cheap rules, and use the model only for the per-over summary and top-take selection. Cost and latency are the first things I'd measure in the pilot.

**"Why not just let the creator read out the chat?"** The creator can only read a few messages, and attention goes to the paying ones. Room Pulse is a per-fan layer, so every fan gets a catch-up and a chance to be recognised.

**"Can the AI make things up?"** Top Takes can't be invented, because the model only returns message ids and the server copies the real text. The match facts come from the event feed. The recap can still be badly worded, which is why the pilot has an evaluation step.

**"Moderation?"** Not built. A toxic message could be picked as a Top Take, so a filter is a required step before any real use. It's on the stretch list.

**"What if the model is down?"** The server falls back to rule-based summaries and canned chat, and the client falls back to a saved snapshot. I built three layers because live demos break.

## What I would build next, with a pilot

1. Connect the real match feed and a read-only chat stream, and drop the simulator.
2. Build an evaluation set of real Hinglish chat, scored by people, before any fan sees it.
3. Add toxicity filtering to Top Takes.
4. Add a creator view: what the room wants discussed.
5. Add Hindi, and measure cost and latency at real volume.
