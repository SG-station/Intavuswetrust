# Kai — Tavus Persona Configuration Guide

> Step-by-step guide to configure the **Alstom Innovation Station Concierge** (Kai) inside the Tavus dashboard, using the files in this folder.

---

## What's in this folder

```
personas/showroom-concierge/
├── README.md                       ← you are here
├── 01-system-prompt.md             ← System prompt (Tavus "Persona" field)
├── 02-context.md                   ← Conversational context (Tavus "Context" field)
├── 03-greeting.txt                 ← Custom greeting (one sentence)
├── 04-hotwords.txt                 ← Speech-to-text vocabulary hints
└── 05-knowledge-base/
    ├── 01-innovation-station-overview.md
    ├── 02-green-mobility.md
    ├── 03-smart-mobility.md
    ├── 04-immersive-mobility-vr.md
    └── 05-3d-printing.md
```

Each file maps to **one specific field or upload** in Tavus.

---

## Where each file goes in Tavus

| File | Goes into | Why |
|---|---|---|
| `01-system-prompt.md` | **System Prompt** field | Kai's identity, tone, rules — the foundation |
| `02-context.md` | **Context** (Conversational Context) field | Facts Kai must know by heart |
| `03-greeting.txt` | **Custom Greeting** field | First sentence Kai speaks |
| `04-hotwords.txt` | **Custom Vocabulary** / **Pronunciation Hints** section | Improves STT accuracy on Alstom-specific terms |
| `05-knowledge-base/*.md` | **Knowledge Base** uploads (RAG documents) | Deep dive content, retrieved on demand |

---

## Step-by-step Tavus configuration

### Step 1 — Log in to Tavus

Go to https://platform.tavus.io and sign in with your Alstom account.

### Step 2 — Create the persona

1. Click **Personas** in the left navigation.
2. Click **Create Persona**.
3. Name it: **`Alstom Innovation Station Concierge — Kai`**
4. Description: *AI concierge for Alstom APAC Innovation Station (Singapore). Welcomes visitors and guides them to the right booth.*

### Step 3 — Choose the replica (visual avatar)

In the persona settings, set:

- **Replica** → choose **Charlie** (or another stock replica with a professional look) from your Tavus replica library
- If "Charlie" isn't available, pick a clean, business-style replica with a neutral background

> Copy the **Replica ID** afterwards — you'll need it for the `.env` of the app:
> `TAVUS_REPLICA_ID=<paste here>`

### Step 4 — Paste the System Prompt

1. Open `01-system-prompt.md` in this folder
2. **Copy everything from the line `You are **Kai**, the AI concierge…` onwards** (skip the markdown title block at the top — Tavus doesn't need the meta description)
3. Paste it into the **System Prompt** field in Tavus
4. Save

### Step 5 — Paste the Context

1. Open `02-context.md`
2. **Copy everything from `## The Innovation Station — what and why` onwards**
3. Paste it into the **Context** (Conversational Context) field in Tavus
4. Save

> If Tavus complains about character count, you can trim Section 9 (wayfinding placeholder) — it's not critical for V1.

### Step 6 — Set the Custom Greeting

1. Open `03-greeting.txt`
2. Copy the single sentence
3. Paste it into the **Custom Greeting** field in Tavus

### Step 7 — Configure the LLM

In the persona's **LLM** section, choose:

- **LLM model**: GPT-4o (or Claude Sonnet if available)
- **Temperature**: **0.6** (warm but consistent — not too creative, not robotic)
- **Max output tokens**: **400** (keeps responses concise for spoken delivery)

### Step 8 — Choose the voice

Pick a voice that matches Kai's professional-but-warm tone. Recommended characteristics:

- Native or near-native English
- Neutral accent (avoid strongly regional — Singapore visitors are international)
- Mid-pitched (avoid extremes)
- Medium pace

Tavus typically uses ElevenLabs voices. Good candidates: "Adam", "Brian", or a similar professional male voice (since Kai's name is gender-neutral but the replica is likely male).

> If you want to test a few voices before deciding, Tavus lets you preview each one. Pick the one that sounds most like a five-star hotel concierge.

### Step 9 — Add Custom Vocabulary (hotwords)

1. Open `04-hotwords.txt`
2. In the Tavus persona settings, find **Custom Vocabulary** or **Pronunciation Hints**
3. Add each term from the list — Tavus may require comma-separated, one-per-line, or a JSON list depending on the UI version
4. Pay special attention to:
   - **Alstom** (so it's not transcribed as "Eel Stom")
   - **Citadis, Coradia, Avelia** (product brands)
   - **EN45545** (the railway standard — STT often mangles this)
   - **Prasarana, BPLRT, SBST, SMRT, A*STAR** (acronyms)
   - **Amrit Raj Singh** (proper name)

### Step 10 — Upload the Knowledge Base documents

1. In the persona settings, go to **Knowledge Base** (or **Documents**)
2. Upload, **in this order**:
   1. `05-knowledge-base/01-innovation-station-overview.md`
   2. `05-knowledge-base/02-green-mobility.md`
   3. `05-knowledge-base/03-smart-mobility.md`
   4. `05-knowledge-base/04-immersive-mobility-vr.md`
   5. `05-knowledge-base/05-3d-printing.md`
3. Wait for Tavus to **index** each document (this can take 30 seconds to a few minutes)
4. Verify each document shows as "Indexed" or "Ready"

> Tavus uses RAG (Retrieval-Augmented Generation). Kai will pull from these documents on demand during conversation, so they don't bloat the system prompt.

### Step 11 — Save the persona

1. Click **Save**
2. Copy the **Persona ID** that appears at the top of the persona page
3. Paste it into your app's `.env`:
   ```
   TAVUS_PERSONA_ID=<paste here>
   ```

### Step 12 — Restart the backend

```bash
cd alstom-concierge-avatar/server
# Update .env with the new Persona ID and Replica ID
npm run dev
```

### Step 13 — Test

1. Open the client at http://localhost:5173
2. Click **Start Conversation**
3. Try these test prompts:
   - *"Hi"* → Kai should greet you and ask what brings you here
   - *"Tell me about 3D Printing"* → Kai should mention 3DPaaS, the Coil Nucleus story, and offer to introduce Amrit Raj Singh
   - *"What's OTES?"* → Kai should explain the energy-savings algorithm with the 95% / 15% numbers
   - *"Show me something cool"* → Kai should suggest the most visually impressive booth based on context
   - *"Tell me about your competitors"* → Kai should politely decline and redirect

If Kai gets any of these wrong, check:
- Did the Knowledge Base finish indexing?
- Is the Context field populated?
- Is temperature set to 0.6, not higher?

---

## How to iterate the persona

Once Kai is live, you'll inevitably want to refine. Here's the recommended workflow:

### Quick edits (no redeploy needed)
- **Change the tone or behaviour** → edit the system prompt in Tavus dashboard
- **Update facts** → edit the context in Tavus dashboard
- **Add new project info** → upload a new file to the Knowledge Base

### Source-of-truth edits (do these first, then sync to Tavus)
- **Always edit the markdown files in this repo first**, commit them to Git
- **Then copy-paste into Tavus dashboard**
- This way the repo stays your editorial source of truth, and Lena/Joanne/Alan can review changes in Git before they go live

### When to bump to a new persona version
- Adding a new booth or major project → new context section, possibly new KB document
- Changing Kai's name or personality → new system prompt
- Switching the replica or voice → new persona (keep the old one as backup)

---

## V1 known limitations and next steps

### Known limitations
- **No physical wayfinding** — Section 9 of `02-context.md` is a placeholder. Update once you decide the booth layout.
- **No real-time data** — Kai doesn't know who's currently visiting, what events are happening, or whether a booth is open/closed.
- **No tool use yet** — Kai can't fetch live data (e.g., booth availability, expert schedules). Tools can be added later via Tavus's function-calling integration.
- **English only** — multilingual support is intentionally deferred.

### Suggested next iterations

1. **Add the physical layout** to the context once Lena confirms it.
2. **Build a Tavus tool** (function call) that lets Kai check whether a specific expert is available — connected to a Notion or Google Calendar API.
3. **Capture transcripts** of real visitor conversations and use them to refine the persona (anonymise first).
4. **Create 2 more personas**: "Web Concierge" (for the website use case) and "3D Printing Copilote" (Amrit Raj Singh's digital twin).
5. **A/B test voices** — try the same Kai with a male voice, female voice, and gender-neutral voice. Measure visitor engagement.

---

## File maintenance

These markdown files are designed to be edited over time as the Innovation Station evolves. Recommended cadence:

- **Monthly review** of the Knowledge Base files (are the numbers still accurate? new projects to add?)
- **Quarterly review** of the system prompt and context (is Kai's tone still right? new rules to add?)
- **Annual full rewrite** of the persona (in alignment with Alstom's annual innovation review)

Always **version your changes** in Git so you can roll back if a refinement makes Kai worse.

---

## Questions or issues?

- Tavus platform issues → https://docs.tavus.io
- Persona content issues → review the source PDFs in `personas/showroom-concierge/source-pdfs/` (if you've added them) or check with Lena
- App / backend issues → see the main project README in `alstom-concierge-avatar/`

Built with care for the Alstom Innovation Station, Singapore.
