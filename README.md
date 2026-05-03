# AmeySing 🎤

**AmeySing** is a premium real-time collaborative karaoke web app. Create a room, search YouTube for karaoke tracks, queue songs, and sing together with friends — from anywhere.

---

## Features

- 🎵 **YouTube Karaoke Search** — search any karaoke track via the server-side YouTube proxy
- 🏠 **Room System** — create a room with a shareable code or QR code
- 👥 **Multi-user Sync** — guests join and see the live queue, synced via PeerJS P2P
- ▶️ **Host Controls** — play, pause, stop, skip, and volume control
- 📋 **Local Library** — curated OPM & international karaoke fallback when search is offline
- ⚙️ **Guest Permissions** — host can toggle whether guests can add songs or control the player
- 📱 **Mobile Responsive** — works on phones and tablets

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Styling | Vanilla CSS (custom property design system) |
| Routing | React Router v7 |
| P2P Sync | PeerJS |
| Backend | Express (Node.js) |
| Search | youtube-sr (server-side scraper) |
| Player | YouTube IFrame API |
| Deployment | Vercel (frontend) + Railway (server) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Install & Run

```bash
# Install root dependencies (frontend)
npm install

# Install server dependencies
cd server && npm install && cd ..

# Start both frontend and backend concurrently
npm run dev
```

The frontend runs at `http://localhost:5173` and the API server at `http://localhost:3001`.

---

## Project Structure

```
AmeySing/
├── src/
│   ├── pages/
│   │   ├── LandingPage.tsx   # Create / Join room
│   │   └── RoomPage.tsx      # Main karaoke room UI
│   ├── hooks/
│   │   ├── usePeerSync.ts    # PeerJS host/guest connection logic
│   │   └── useYouTubePlayer.ts # YT IFrame player lifecycle
│   ├── lib/
│   │   └── searchYouTube.ts  # Search util + local song library
│   ├── types/
│   │   └── index.ts          # Shared TypeScript interfaces
│   └── index.css             # Global design system styles
├── server/
│   └── server.js             # Express YouTube search proxy
└── api/
    └── search.js             # Vercel serverless function (same search)
```

---

## Deployment

- **Frontend**: Deploy to Vercel — set `VITE_` env vars as needed
- **Backend**: Deploy `server/` to Railway using `railway.json` config

---

## Notes

- The `api/search.js` is for **Vercel** serverless deployment (same logic as the Express server)
- The server currently uses **PeerJS** for P2P sync — suitable for small groups. For larger-scale production, see the TODO in `server/server.js` for a Socket.IO migration path.
