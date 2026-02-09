# LocalVibe - Community Event Discovery App

## Overview
LocalVibe is a community event discovery application where users can browse, create, and RSVP to local events. Built with React + Vite (frontend) and Express.js (backend), using PostgreSQL for data storage.

## Project Architecture
- **Frontend**: React 19 + TypeScript + Vite, served on port 5000 (0.0.0.0)
  - UI: Radix UI components, Tailwind CSS, Lucide icons
  - Routing: react-router-dom
  - Maps: Leaflet / react-leaflet
  - State: React Context (Auth, Location)
- **Backend**: Express.js (CommonJS), served on port 3001 (127.0.0.1)
  - Auth: JWT (jsonwebtoken + bcryptjs)
  - DB: PostgreSQL via `pg` (Pool)
  - Validation: express-validator
- **Database**: PostgreSQL (Replit built-in)
  - Tables: users, events, rsvps
- **Proxy**: Vite dev server proxies `/api` requests to backend on port 3001

## Key Files
- `vite.config.ts` - Frontend config (host, port, proxy, aliases)
- `server/server.cjs` - Express backend (all API routes)
- `server/seed.cjs` - Database seeding script
- `src/App.tsx` - React app entry with routing
- `src/services/api.ts` - Axios API client
- `src/context/` - Auth and Location context providers

## Development
- Workflow: `node server/server.cjs & npm run dev`
- Backend runs on port 3001, frontend on port 5000
- Vite proxies `/api/*` to backend

## Recent Changes
- 2026-02-09: Initial Replit setup - configured database schema, seeded data, fixed server binding (127.0.0.1), removed .replit from .gitignore
