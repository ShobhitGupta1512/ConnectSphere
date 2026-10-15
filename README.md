::: {align="center"}
# ConnectSphere

### Real-Time Video Meetings, Built for the Web

A browser-based meeting experience with room-based participation, WebRTC
media connections, and Socket.IO signaling.

[![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-Build%20Tool-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-010101?logo=socketdotio&logoColor=white)](https://socket.io/)
[![WebRTC](https://img.shields.io/badge/WebRTC-Media%20Connections-333333)](https://webrtc.org/)

**Developer:** Shobhit Kumar\
**Portfolio:** [shobhitdev.online](https://www.shobhitdev.online/)\
**Repository:** Add your verified GitHub repository URL\
**Live demo:** Add your deployed application URL
:::

------------------------------------------------------------------------


## Product Preview

### Meeting Workspace

![ConnectSphere meeting room](./meeting-room.png)

### Dashboard

![ConnectSphere dashboard](./dashboard.png)
------------------------------------------------------------------------

## Overview

ConnectSphere is a real-time video-conferencing project designed around
a simple workflow: create or join a meeting, share a meeting code, and
communicate through a browser-based meeting room.

The frontend is built with React and Vite. The Node.js and Express
backend uses Socket.IO to coordinate room participation and relay WebRTC
signaling messages. WebRTC is responsible for negotiating peer
connections and carrying media between browsers when network conditions
allow.

The project is being developed as a practical full-stack application,
with a focus on real-time communication, component-based UI, media
lifecycle management, and maintainable client/server boundaries.

> **Status:** The supplied screenshots show a working dashboard and a
> meeting-room interface with local and remote participant tiles.
> Features and deployment requirements should be validated against the
> current code before describing the application as production-ready.

## Features

-   **Meeting dashboard** --- create a meeting or join an existing room
    using a meeting code.
-   **Room-based participation** --- join/leave events and participant
    presence through Socket.IO.
-   **WebRTC signaling** --- exchange offers, answers, and ICE
    candidates through the signaling server.
-   **Audio/video interface** --- local media preview and remote
    participant tiles.
-   **Media controls** --- camera and microphone controls in the meeting
    interface.
-   **Connection status** --- visible indication of the Socket.IO
    connection state.
-   **Meeting-code sharing** --- copy the code to invite another
    participant.
-   **Modular hooks** --- separate responsibilities for media capture,
    socket events, and WebRTC behavior.

Availability of individual features depends on the current
implementation and environment. Cross-network reliability, TURN support,
authentication, persistent chat, and other production controls must be
implemented and tested where required.

## Technology Stack

  -----------------------------------------------------------------------
  Layer                   Technology              Responsibility
  ----------------------- ----------------------- -----------------------
  Frontend                React                   UI and application
                                                  state

  Frontend tooling        Vite                    Development server and
                                                  production build

  Backend runtime         Node.js                 Server-side JavaScript

  HTTP server             Express                 Backend server and API
                                                  foundation

  Real-time signaling     Socket.IO               Room events and
                                                  signaling relay

  Media transport         WebRTC                  Peer-to-peer
                                                  audio/video

  Database                MongoDB                 Persistence where
                                                  database operations are
                                                  implemented

  Version control         Git and GitHub          Source management
  -----------------------------------------------------------------------

## Architecture

``` text
Browser A                         Node.js / Express
React + Vite                      Socket.IO server
getUserMedia()                         |
     |                                 |
     +---- WebRTC offer/answer --------+
     +---- ICE candidate signaling ----+
     |                                 |
     +========== WebRTC media ==========+---- Browser B
                 peer-to-peer                 React + Vite
```

Socket.IO carries meeting events and WebRTC signaling; it does not carry
the actual audio/video stream in this peer-to-peer design. A STUN/TURN
configuration helps peers discover a viable network path. STUN alone
cannot guarantee connectivity on every network.

The current mesh approach creates peer connections between participants.
As meeting size grows, the number of peer connections and upload
bandwidth can increase quickly. An SFU-based media architecture may be
more appropriate for larger meetings.

## Project Structure

The paths below reflect the known frontend/backend layout. Adjust the
tree if your repository differs.

``` text
ConnectSphere/
├── frontend/
│   └── vite-project/
│       ├── src/
│       │   ├── hooks/
│       │   │   ├── useMediaStream.js
│       │   │   ├── useMeetingSocket.js
│       │   │   └── useWebRTC.js
│       │   ├── components/
│       │   ├── pages/
│       │   ├── App.jsx
│       │   └── main.jsx
│       └── package.json
├── backend/
│   ├── src/
│   │   └── controllers/
│   │       └── socketManager.js
│   └── package.json
├── docs/
│   └── screenshots/
│       ├── dashboard.png
│       └── meeting-room.png
└── README.md
```

## Run Locally

### Prerequisites

-   Node.js LTS and npm
-   Git
-   A modern browser with camera and microphone support
-   MongoDB, if required by the enabled database features

### 1. Clone your repository

Replace the URL below with the actual repository URL:

``` bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_REPOSITORY_FOLDER>
```

### 2. Install frontend dependencies

``` bash
cd frontend/vite-project
npm install
```

### 3. Install backend dependencies

Open a second terminal from the project root:

``` bash
cd backend
npm install
```

### 4. Configure environment variables

Create `frontend/vite-project/.env.local`:

``` env
VITE_SOCKET_URL=http://localhost:8000
```

Create `backend/.env` using only the variables your server actually
reads. For the current development configuration, that may include:

``` env
PORT=8000
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/connectsphere
```

If the backend does not currently use `MONGODB_URI`, do not add it as
though database persistence were active. Check the backend configuration
and package scripts before starting the app.

### 5. Start the backend

From `backend`, use the development script defined in `package.json`. If
it is named `dev`:

``` bash
npm run dev
```

### 6. Start the frontend

From `frontend/vite-project`:

``` bash
npm run dev
```

Open the local URL printed by Vite, commonly `http://localhost:5173`.
The frontend socket URL and backend CORS origin must match the ports and
hostnames you are actually using.

### Camera and microphone permissions

Browsers generally require a secure context for camera and microphone
access. `localhost` is treated as secure for development; testing from
another device over a plain HTTP LAN address may not work. Use a trusted
HTTPS development setup or an HTTPS deployment for cross-device tests.

## Real-Time Events

The current Socket.IO meeting flow includes these event names:

  -------------------------------------------------------------------------
  Event                     Direction               Purpose
  ------------------------- ----------------------- -----------------------
  `join-call`               Client → Server         Request to join a room

  `existing-participants`   Server → Client         Return existing
                                                    participant identifiers

  `user-joined`             Server → Clients        Announce a participant
                                                    joining

  `user-left`               Server → Clients        Announce a participant
                                                    leaving

  `signal`                  Client ↔ Server ↔       Relay WebRTC signaling
                            Client                  data

  `leave-call`              Client → Server         Leave the meeting room
  -------------------------------------------------------------------------

The exact signaling payload must match the implementation in both the
client and server. Validate payload shape, recipient identity, room
membership, and message size on the server.

## Production Deployment Checklist

Before inviting public users, verify each item in the deployed
environment.

-   [ ] Deploy the frontend over HTTPS.
-   [ ] Deploy the backend with HTTPS/WSS and persistent WebSocket
    support.
-   [ ] Set the production frontend origin in the backend CORS
    configuration.
-   [ ] Configure a TURN service with short-lived credentials.
-   [ ] Test two or more devices on different networks.
-   [ ] Verify camera/microphone toggles and cleanup when leaving.
-   [ ] Test reconnection, ICE failure, and participant departure.
-   [ ] Add authentication and server-side meeting authorization as
    required.
-   [ ] Validate and rate-limit socket events.
-   [ ] Keep secrets out of frontend environment variables and Git.
-   [ ] Configure database access, backups, and persistence if MongoDB
    is used.
-   [ ] Add server logs, health checks, error monitoring, and automated
    tests.
-   [ ] Publish a privacy notice that explains media access and data
    handling.

A successful local demo does not by itself establish production
readiness. Do not claim end-to-end encryption, recording, persistent
chat, or large-meeting scalability unless those capabilities have been
implemented and verified.

## Roadmap

Potential next steps, to be checked off only when implemented and
tested:

-   [ ] Improve WebRTC renegotiation and recovery after connection
    failure.
-   [ ] Add TURN support and cross-network test coverage.
-   [ ] Add authenticated meetings and access controls.
-   [ ] Persist meeting metadata and chat messages.
-   [ ] Add screen sharing and host moderation.
-   [ ] Add automated integration and browser tests.
-   [ ] Evaluate an SFU for larger meetings.
-   [ ] Improve accessibility, responsive layouts, and user-facing error
    states.

## Contributing

Contributions and constructive feedback are welcome.

1.  Fork the repository.
2.  Create a focused feature branch.
3.  Make and test your changes.
4.  Commit with a descriptive message.
5.  Open a pull request describing the change and how it was tested.

## Author

**Shobhit Kumar**\
B.Tech Computer Science and Engineering \| Full-Stack Development

-   **Portfolio:** <https://www.shobhitdev.online/>
-   **GitHub profile:** <https://github.com/ShobhitGupta1512>
-   **Project repository:** Add your verified ConnectSphere repository
    URL
-   **Live demo:** Add your deployed frontend URL

------------------------------------------------------------------------

::: {align="center"}
**ConnectSphere --- Your space to connect.**

Built by Shobhit Kumar
:::
