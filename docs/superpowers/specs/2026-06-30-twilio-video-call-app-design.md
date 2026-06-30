# TwilioMeet — Video Call App (Learn-by-Doing)

**Date:** 2026-06-30
**Status:** Approved design, ready for implementation planning

## Purpose

A small, complete video-calling web app built to **learn the Twilio Video API
hands-on**. Optimized for understanding, not production: each feature maps to a
core Twilio Video concept, and the build order is incremental so every step is
runnable.

> **Note on Twilio Programmable Video:** Twilio has announced an end-of-life path
> for Programmable Video. This project is for learning; the WebRTC/token concepts
> transfer to other providers. Do not pick this stack for a new production app.

## Scope

### In scope (MVP)
- **Lobby screen:** enter display name + room name, click Join. No login, no DB.
- **Room screen:** join a video call by room name; anyone using the same room
  name joins the same call.
- **In-call features:**
  1. Mute / unmute microphone
  2. Start / stop camera (and "join audio-only" path)
  3. Participant grid with display names, live join/leave handling
  4. Screen sharing
  5. Text chat (Twilio DataTrack)
  6. Leave call (return to lobby)

### Out of scope (explicitly not building now)
- User accounts / authentication / database
- A lobby list of active rooms (room is joined by typing its name)
- Real phone calls (PSTN) / Twilio Voice
- Recording, virtual backgrounds, network-quality UI
- Production deployment / hosting (noted below, but not built)

## Architecture

```
Browser (React + shadcn)  ──1. POST /api/token {identity, room}──►  Backend (Express+TS)
        │                 ◄──────── 2. { token } ─────────────────         │
        │                                                          mints AccessToken
        │                                                          (VideoGrant) signed
        │                                                          with Twilio API secret
        └──3. twilio-video.connect(token, {name: room}) ──►  Twilio Cloud (media SFU)
                         video/audio/screen/chat flow through Twilio's servers
```

**Why a backend exists:** The Twilio API secret must never reach the browser.
The backend's only job is to mint a short-lived access token scoped to a Video
grant. This is the single security concept the project teaches.

**Why Twilio is in the middle:** Twilio runs the media server (SFU) that relays
each participant's audio/video. The app never manages raw WebRTC peer
connections — the `twilio-video` SDK plus Twilio handle that.

## Project Structure

```
backend/
  src/index.ts        # Express app, CORS, /api/token route, startup env validation
  src/twilio.ts       # token-minting logic (pure, testable, no HTTP)
  src/twilio.test.ts  # unit test: decode minted JWT, assert grant + identity
  package.json
  tsconfig.json
  .env                # TWILIO_ACCOUNT_SID, TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET (gitignored)
  .env.example        # documents required vars

frontend/src/                   # Vite+React 19+Tailwind v4+shadcn; @ -> ./src
  App.tsx                       # routes between Lobby and Room (simple state, no router lib)
  lib/twilioClient.ts           # fetch token from backend; connect/disconnect helpers
  hooks/useRoom.ts              # owns the Twilio Room object + participant state
  components/Lobby.tsx          # name + room form (shadcn Input, Button, Card)
  components/Room.tsx           # layout: grid + control bar + chat panel
  components/ParticipantGrid.tsx
  components/Participant.tsx    # one person's video/audio tile
  components/ControlBar.tsx     # mute / camera / screen-share / leave (shadcn Button)
  components/ChatPanel.tsx      # DataTrack text chat (shadcn)
```

## Feature → Twilio Concept Map

| Feature | Twilio concept learned |
|---|---|
| Mute mic / toggle camera | Enable/disable a **local track** |
| Participant grid | `participantConnected` / `participantDisconnected` events; `trackSubscribed` |
| Screen share | `getDisplayMedia()` → publish an extra **LocalVideoTrack**; unpublish to stop |
| Text chat | **LocalDataTrack** send; remote `DataTrack` `message` event |
| Token minting | Server-side **AccessToken** + **VideoGrant** signed with API secret |

## Data Model / State

- **No persistent storage.** All state is in-memory in the browser for the
  duration of a call.
- Frontend room state (in `useRoom`): the connected `Room`, a map of remote
  participants → their subscribed tracks, and local toggle flags (mic on,
  camera on, screen-sharing). State updates are driven by Twilio SDK events.
- Backend is stateless: each `/api/token` request is independent.

## API Contract

`POST /api/token`
- Request body: `{ "identity": string, "room": string }` (both non-empty)
- Success `200`: `{ "token": string }` (a Twilio AccessToken JWT)
- Error `400`: `{ "error": string }` when identity or room is missing/empty
- Error `500`: `{ "error": string }` on server misconfiguration

## Error Handling

- **Camera/mic permission denied** → friendly message; offer to join audio-only.
- **Token fetch fails / backend down** → toast (or inline error); remain on lobby.
- **Missing Twilio env vars** → backend validates at **startup** and exits with a
  clear message, rather than failing with a vague 500 on first request.
- **Empty name or room** → Join button disabled; backend also rejects with 400.
- **Room connect failure** (e.g. bad/expired token) → surface error, return to lobby.

## Testing Strategy

- **Backend unit:** `twilio.ts` mints a token; test decodes the JWT and asserts
  identity and the presence of a Video grant.
- **Backend integration:** `POST /api/token` returns 200 + token for valid input,
  400 for empty input.
- **Frontend unit:** the token-fetch helper (mocked `fetch`) and the
  participant-state reducer logic in `useRoom`. The Twilio SDK is mocked — we test
  our glue code, not Twilio's library.
- Target: meaningful coverage of our own logic (token endpoint, state reducer,
  fetch helper). UI rendering covered lightly.

## Environment & Running

- Works on `http://localhost` — browsers allow camera/mic access on localhost,
  so no HTTPS needed for single-machine multi-tab testing.
- **Cross-device testing caveat:** testing across two different physical devices
  requires HTTPS (e.g. a free `ngrok` or `cloudflared` tunnel to the frontend and
  backend). This is noted for later; deployment is **not** built in this project.
- Requires a free Twilio account: Account SID, plus an API Key SID + Secret
  (created in the Twilio console). These go in `backend/.env`.

## Incremental Build Order

Each step is independently runnable and verifiable:

1. Backend `/api/token` endpoint → verify with `curl`.
2. Lobby form → fetch a token and `console.log` it.
3. Connect to a room + render your own local video.
4. Participant grid → handle remote join/leave (test with two browser tabs).
5. Control bar: mute mic + toggle camera.
6. Screen sharing.
7. Text chat (DataTrack).

## Open Items / Decisions Made

- **Routing:** simple `useState`-based screen switching in `App.tsx` (Lobby vs
  Room). No router library — not needed for two screens.
- **Styling:** shadcn/ui components already scaffolded in `frontend/twilio`.
- **Room creation:** rooms auto-create on first join (Twilio default behavior);
  no separate "create room" call.
