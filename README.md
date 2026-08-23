# 📚 Nerdy's — The Social Reading & Literary Discovery Platform

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-ESM-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.0-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.3-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?logo=socketdotio&logoColor=white)](https://socket.io/)

**Nerdy's** is an open-source, full-stack social platform designed for passionate readers, book clubs, and literary enthusiasts. It combines multi-provider book discovery, personal reading journals, community spoiler-guarded reviews, real-time chat lounges, AI-assisted librarian recommendations, and a gamified **Reading DNA** analytics engine.

---

## ✨ Key Features

### 🔍 1. Resilient Multi-Provider Discovery & Cover Reverse Proxy
- **Dual-Provider Architecture**: Searches Open Library with automatic fallback to Google Books for maximum catalog coverage and zero downtime.
- **SSRF-Safe Cover Image Reverse Proxy**: High-performance `/api/books/cover` endpoint proxies and caches book cover images (24-hour cache headers) with IP/domain whitelisting, protecting client privacy and bypassing restrictive ISP network blocks.
- **Data-Driven Genre Explorer**: Dynamic, curated genre shelves with smooth horizontal scrolling.

### 🧬 2. Reading DNA™ & Literary Codex
- **Letterboxd-Style 7-Tab Profile**: Dedicated dashboard tabs for Overview, Activity, Books, Reviews, Favorites, Stats/Codex, and Trophies.
- **Algorithmic Personality Engine**: Classifies reader archetypes (e.g., *Vanguard Explorer*, *Philosophical Scholar*, *Lore Keeper*) from logging habits and genre affinities.
- **Reading Metrics & Velocity**: Visual streak trackers, annual challenge progress, high-rating ratios, and review depth metrics.
- **Achievement & Trophy System**: Unlockable tiered badges for milestones, multi-genre exploration, and community engagement.

### 💬 3. Real-Time Book Club Lounges
- **Live Room-Based Chat**: Powered by Socket.io with persistent room histories.
- **Reader Presence**: Live online reader counters, typing indicators, and markdown/quote support.

### 📖 4. Reading Journals & Community Reviews
- **Rich Book Logging**: 5-star rating system, date read, reading notes, and spoiler protection flags.
- **Spoiler-Safe Feed**: Community reviews feature explicit "Click to Reveal" protections for plot spoilers.
- **Universal Favorites**: One-click book favoriting synchronized across devices and profiles.

### 🤖 5. AI Librarian & Recommendation Engine
- **Conversational Assistant**: Rule-based and LLM-ready librarian providing personalized suggestions based on mood, favorite tropes, and recent reading history.
- **Speech Recognition Support**: Integrated voice queries for accessibility.

---

## 🏗️ Architecture & Tech Stack

```
┌──────────────────────────────────────────────────────────────────────────┐
│                             Client (Vite SPA)                            │
│  React 19 • TypeScript 5.7 • Lucide Icons • Recharts • Vanilla CSS       │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ HTTP (REST) / WebSocket (Socket.io)
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          Express 5 API Server                            │
│  Node.js (ESM) • JWT Auth • Google OAuth • Image Proxy • In-Flight Dedup │
└──────────────────┬─────────────────┬───────────────────┬─────────────────┘
                   │                 │                   │
                   ▼                 ▼                   ▼
          ┌─────────────────┐ ┌──────────────┐ ┌───────────────────┐
          │   PostgreSQL    │ │ Open Library │ │ Google Books API  │
          │  (Prisma 7 ORM) │ │ API & Covers │ │    (Fallback)     │
          └─────────────────┘ └──────────────┘ └───────────────────┘
```

### Frontend (`client/`)
- **Framework**: React 19, TypeScript, Vite 7
- **Styling**: Modern CSS Design System (`client/src/styles/`) with CSS custom properties, glassmorphism, and responsive layouts
- **Routing**: React Router DOM v7
- **State & Auth**: `AuthContext` with JWT synchronization and Google Sign-In button

### Backend (`server/`)
- **Runtime**: Node.js with native ES Modules (`"type": "module"`)
- **Framework**: Express 5.x
- **Database & ORM**: PostgreSQL via Prisma 7 (`@prisma/adapter-pg`)
- **Realtime**: Socket.io with JWT handshake verification
- **Services**:
  - `BookService`: Aggregator and deduplicator across metadata providers
  - `DnaComputeService`: Async reader profile and badge computation with deduplication

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v20.x or v22.x+
- **PostgreSQL**: v14+ (Local instance, Docker, or hosted like Neon/Supabase)
- **npm** or **pnpm**

---

### 1. Clone the Repository
```bash
git clone https://github.com/dhruvnarang786/Nerdy-s-.git
cd Nerdy-s-
```

---

### 2. Configure Environment Variables

#### Backend (`server/.env`):
```env
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/nerdys?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
CLIENT_URL="http://localhost:5173"

# Optional External API Keys
GOOGLE_BOOKS_API_KEY=""
GEMINI_API_KEY=""
```

#### Frontend (`client/.env`):
```env
VITE_API_URL="http://localhost:5000"
VITE_GOOGLE_CLIENT_ID="your-google-oauth-client-id"
```

---

### 3. Setup the Database
```bash
cd server
npm install
npx prisma generate
npx prisma db push
node seed_logs.js       # (Optional) Seed demo users, books, and logs
```

---

### 4. Run the Development Servers

#### Terminal 1 — Backend:
```bash
cd server
npm run dev
# Server running at http://localhost:5000
```

#### Terminal 2 — Frontend:
```bash
cd client
npm install
npm run dev
# Client running at http://localhost:5173
```

---

## 🛠️ Available Scripts

### Client (`client/`)
| Command | Description |
|---|---|
| `npm run dev` | Starts Vite development server with Hot Module Replacement |
| `npm run build` | Compiles TypeScript (`tsc -b`) and bundles production assets with Vite |
| `npm run lint` | Runs ESLint across all TypeScript & React files (0 errors target) |
| `npm run preview` | Previews the local production build |

### Server (`server/`)
| Command | Description |
|---|---|
| `npm run dev` | Runs Express server with nodemon auto-reload |
| `npm start` | Runs Express server with standard Node runtime |
| `npx prisma studio` | Opens the interactive Prisma visual database explorer |
| `npx prisma db push` | Synchronizes database schema with `schema.prisma` |

---

## 📡 API Reference Overview

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/register` | `POST` | Public | Create new account with email, username & password |
| `/api/auth/login` | `POST` | Public | Authenticate user & receive JWT token |
| `/api/auth/google` | `POST` | Public | Google OAuth token verification and account creation |
| `/api/books/search` | `GET` | Public | Search books across Open Library and Google Books |
| `/api/books/trending`| `GET` | Public | Fetch popular & curated trending books |
| `/api/books/cover` | `GET` | Public | High-performance reverse proxy for book cover images |
| `/api/books/:id` | `GET` | Public | Detailed book metadata, synopses, and genres |
| `/api/logs` | `GET`, `POST` | User | Read user's journal / Create a new book log |
| `/api/logs/book/:id` | `GET` | Public | Fetch community logs for a specific book |
| `/api/favorites` | `GET`, `POST` | User | View or toggle favorite books |
| `/api/dna` | `GET` | User | Get computed Reading DNA analytics & archetypes |
| `/api/dna/recompute`| `POST` | User | Trigger incremental recalculation of DNA metrics |
| `/api/friends` | `GET`, `POST` | User | List friend connections or send friend request |
| `/api/profile` | `GET`, `PUT` | User | Read or update user bio and reading goals |

---

## 🔒 Security & Reliability Architecture
- **SSRF Hardened**: Reverse proxy validates all target URLs against a strict whitelist of known book CDNs and filters out local subnets (`127.0.0.1`, `10.0.0.0/8`, `192.168.0.0/16`).
- **Concurrent Compute De-duplication**: DNA recomputation requests are queued with in-flight mutex tracking to prevent DB CPU spikes during bursts.
- **Graceful Network Degradation**: If Open Library rate limits or network issues occur, the server automatically queries Google Books and converts response formats seamlessly.

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
