# Intavuswetrust

A workspace for the Alstom Innovation Station concierge avatar proof-of-concept.

This repository contains a Vite + React + Tailwind frontend and a Node + Express backend that together host a Tavus-powered AI concierge avatar experience. The app is designed as a laptop-testable showroom prototype with support for switching into showroom mode, scanning a QR code to use a phone as a microphone, and ending the conversation cleanly.

## Project overview

- `alstom-concierge-avatar/client`: React front-end application for the AI avatar interface.
- `alstom-concierge-avatar/server`: Express backend that proxies conversation creation and teardown to the Tavus API.
- `personas_archived`: archived persona and showroom content supporting the concierge concept.

## Architecture

1. Frontend (`client`) requests a new conversation from the backend.
2. Backend (`server`) creates a Tavus conversation using a replica and persona ID.
3. Client embeds the returned conversation URL and joins the room using `@daily-co/daily-js`.
4. The user interacts with the avatar through the browser. In showroom mode, a QR code allows a phone to join as a microphone source.

## Creator

This prototype was built by the creator as a proof-of-concept showroom experience for Alstom Innovation Station. The project demonstrates a lightweight React + Tailwind + Node implementation that combines Tavus AI avatar conversations, Daily.co video room integration, fullscreen showroom UI, and mobile microphone pairing via QR code.

## Features

- Start / end Tavus conversations from the browser.
- Fullscreen avatar view with branded UI.
- Local PiP camera preview in standard laptop mode.
- Showroom mode with QR code discovery and phone mic connection.
- Mute / unmute controls during active conversation.
- Backend-protected Tavus API key and simple proxy endpoints.

## Technologies

- Frontend: React, Vite, Tailwind CSS, GSAP for background animation.
- Backend: Node.js, Express, CORS, dotenv.
- Video / conversation layer: Tavus API + Daily.co (`@daily-co/daily-js`).
- QR codes: `qrcode.react`.

## Running locally

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Intavuswetrust
```

### 2. Install dependencies

```bash
cd alstom-concierge-avatar/server
npm install
cd ../client
npm install
```

### 3. Configure environment variables

Create `alstom-concierge-avatar/server/.env` with:

```env
TAVUS_API_KEY=your_tavus_api_key_here
TAVUS_REPLICA_ID=your_replica_id_here
TAVUS_PERSONA_ID=your_persona_id_here
TAVUS_GREETING=Hello, welcome to the Alstom Concierge
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
```

In the frontend, `VITE_API_BASE` can remain empty for local development because Vite proxy forwards `/api/*` to the backend.

### 4. Start the app

Open two terminals and run:

```bash
cd alstom-concierge-avatar/server
npm run dev
```

```bash
cd alstom-concierge-avatar/client
npm run dev
```

Then open the URL shown by Vite (typically `http://localhost:5173`).

## Folder structure

```text
alstom-concierge-avatar/
├── client/
│   ├── public/                 # Static assets and images
│   ├── src/                    # React source files
│   │   ├── App.jsx             # Main app shell and UI state
│   │   ├── main.jsx            # App entry point and router
│   │   ├── MicPage.jsx         # Phone-side microphone page
│   │   ├── SharePointPage.jsx  # Showroom video display page
│   │   ├── components/         # Reusable UI components
│   │   └── index.css           # Global styles
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── index.js                # Express server and Tavus proxy
│   ├── package.json
│   └── .env.example            # Example environment settings
└── personas_archived/          # Archived persona prompts and knowledge base
```

## Backend API

- `POST /api/conversation` — create a new Tavus conversation.
- `DELETE /api/conversation/:id` — end an existing conversation.
- `GET /api/health` — health check endpoint.

## Notes

- The backend keeps the Tavus API key out of the browser.
- The app currently supports laptop testing first; showroom phone-mic support is built into the same codebase.
- The `personas_archived` folder contains supporting persona prompts and showroom content, but the active app uses the configured Tavus persona and replica IDs from `.env`.

## Future work

- Add QR code / LG StanbyMe kiosk deployment flow.
- Create a custom Alstom persona with showroom knowledge base content.
- Deploy frontend and backend to production hosting.

---

Built as a prototype for the Alstom Innovation Station showroom experience.