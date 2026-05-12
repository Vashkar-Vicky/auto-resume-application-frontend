# linkedin-platform-frontend

Next.js 14 frontend for the LinkedIn automation platform. Talks to the Go API at `linkedin-platform-backend` via REST + JWT, with a WebSocket channel for live session events.

## Dev

```bash
cp .env.example .env.local
npm install
npm run dev
```

App runs at http://localhost:3000 and expects the backend at http://localhost:8080.

## Build

```bash
npm run build
npm start
```

Or `docker build -t linkedin-platform-frontend .`

## Layout

- `src/` — App Router pages, components, stores
- `public/` — static assets
- `Dockerfile` — production build

## Backend

Backend repo: `../linkedin-platform-backend`. Start it with `docker compose -f deployments/docker/docker-compose.yml up`.
