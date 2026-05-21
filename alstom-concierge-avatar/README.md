# Alstom Innovation Station — Concierge Avatar (V1)

AI concierge avatar powered by Tavus CVI, designed for the Alstom Innovation Station showroom in Singapore.

This V1 is a **laptop-testable web interface** — visitors interact with the avatar using the laptop's built-in mic and camera. The QR code + LG StanbyMe deployment will be added in a later iteration.

## Architecture

```
┌─────────────────────────────────────┐
│   client/   (Vite + React + Tailwind)│
│   - Avatar video container           │
│   - Start / End conversation UI      │
│   - Alstom branding                  │
└───────────────┬─────────────────────┘
                │ POST /api/conversation
                ▼
┌─────────────────────────────────────┐
│   server/   (Node + Express)         │
│   - Hides Tavus API key              │
│   - Creates conversation via Tavus   │
│   - Returns conversation_url         │
└───────────────┬─────────────────────┘
                │ Tavus API
                ▼
        https://tavusapi.com/v2/conversations
```

## Stack

- **Frontend** : Vite + React + Tailwind CSS
- **Backend** : Node.js + Express
- **CVI** : Tavus API (`@daily-co/daily-js` under the hood, embedded via iframe in V1)
- **Branding** : Alstom February 2026 V1.0 (Carbon Blue, Dynamic Ultramarine, Limestone Grey)

## Quick start (local development)

### 1. Clone & install

```bash
git clone <your-repo-url>
cd alstom-concierge-avatar

# Install backend
cd server
npm install

# Install frontend
cd ../client
npm install
```

### 2. Configure environment variables

Create `server/.env` with:

```
TAVUS_API_KEY=your_tavus_api_key_here
TAVUS_REPLICA_ID=rfe12d8b9597        # Charlie (or any stock replica from your Tavus dashboard)
TAVUS_PERSONA_ID=pdced222244b        # Stock persona — we'll create a custom Alstom persona later
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
```

Where to find these IDs :
- **API key** : https://platform.tavus.io → Settings → API Keys
- **Replica ID** : https://platform.tavus.io/replicas → hover the replica → "Copy Replica ID"
- **Persona ID** : https://platform.tavus.io/personas → "Copy Persona ID"

### 3. Run

In two terminals :

```bash
# Terminal 1 — backend
cd server
npm run dev

# Terminal 2 — frontend
cd client
npm run dev
```

Open http://localhost:5173 → click "Start Conversation" → talk to the avatar.

## Project structure

```
alstom-concierge-avatar/
├── client/
│   ├── public/
│   │   └── alstom-logo.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── AvatarFrame.jsx       # Iframe container for the Tavus conversation
│   │   │   ├── ControlBar.jsx        # Start / End / status buttons
│   │   │   └── BrandHeader.jsx       # Alstom logo top-right
│   │   ├── styles/
│   │   │   └── alstom.css            # Brand tokens
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
├── server/
│   ├── index.js                       # Express server + Tavus proxy
│   ├── package.json
│   └── .env.example
├── .gitignore
└── README.md
```

## Tavus session limits to keep in mind

Starter plan ($59/mo) :
- **100 minutes** of conversational video per month
- **3 custom replica trainings** per month
- **Up to 3 concurrent streams**
- Pay-as-you-go beyond — no overage cap

The current V1 has no automatic timeout. **End the conversation manually after each test** to preserve minutes.

## Roadmap

- [x] V1 — Laptop-testable web interface
- [ ] V2 — QR code + phone-as-mic + LG StanbyMe deployment
- [ ] V3 — Custom Alstom concierge persona (booth knowledge base)
- [ ] V4 — Deployment on Render (backend) + GitHub Pages (frontend)

## License

Internal — Alstom Innovation Station, Singapore.
