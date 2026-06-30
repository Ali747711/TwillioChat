# TwilioMeet — Learn-by-Doing Video Call App

A minimal browser video-calling app built to learn the Twilio Video API:
lobby → room with mic/camera toggle, participant grid, screen share, and text chat.

- **`backend/`** — Node + Express + TypeScript. One job: mint short-lived Twilio
  access tokens (`POST /api/token`). The Twilio secret lives only here.
- **`frontend/`** — React 19 + Vite + Tailwind + shadcn/ui, using the
  `twilio-video` SDK.

See the design and step-by-step plan in `docs/superpowers/`.

## 1. Get Twilio credentials

You need three values from the [Twilio Console](https://console.twilio.com):

| Value | Where | Looks like |
|---|---|---|
| Account SID | Dashboard home → Account Info | `AC...` |
| API Key SID | Account → API keys & tokens → **Create API key** (Standard) | `SK...` |
| API Key Secret | shown **once** when you create the API key — copy it then | long random string |

> Use an **API Key** (SID starts with `SK`), not your Auth Token. Video access
> tokens can only be signed with an API Key + Secret.

Put them in `backend/.env`:

```
TWILIO_ACCOUNT_SID=AC...
TWILIO_API_KEY_SID=SK...
TWILIO_API_KEY_SECRET=...
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

## 2. Run it (two terminals)

```bash
# terminal 1 — token server
cd backend
npm install      # first time only
npm run dev      # http://localhost:3001

# terminal 2 — web app
cd frontend
npm install      # first time only
npm run dev      # http://localhost:5173
```

## 3. Try a call

Open `http://localhost:5173` in **two browser tabs**. In each, enter a different
name but the **same room name**, then Join (allow camera + mic). You should see
both tiles. Test mute, camera, screen share, chat, and leave.

> Two tabs on one machine work over `http://localhost`. To test across two
> different devices you'd need HTTPS (e.g. an `ngrok`/`cloudflared` tunnel) —
> not set up here.

## Tests

```bash
cd backend  && npm test    # token server unit/integration tests
cd frontend && npm test    # token fetch + participants reducer tests
```
