# DunnoAI LLM Tracker — Project Overview

## What This Is
An end-to-end LLM analytics platform (replica of Voker). Tracks every LLM call made by AI agents — events, sessions, people, agents — and visualises them in a dashboard.

## Stack
| Layer | Tech |
|-------|------|
| Backend API | FastAPI + Supabase (PostgreSQL) |
| Frontend | Expo React Native (web-first dashboard) |
| Python SDK | `sdks/python/voker/` |
| TypeScript SDK | `sdks/typescript/src/` |
| Database | Supabase (hosted PostgreSQL) |

## Directory Structure
```
dunno_tracker/
├── backend/          # FastAPI REST API
├── frontend/         # Expo React Native dashboard
├── sdks/
│   ├── python/       # pip install voker (local)
│   └── typescript/   # npm install @voker/voker (local)
└── CLAUDE.md
```

## How to Run Everything

### 1. Backend
```bash
cd backend
source .venv/bin/activate      # python -m venv .venv if first time
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Swagger UI: http://localhost:8000/docs

### 2. Frontend
```bash
cd frontend
npm install                    # first time only
npm run web                    # opens at http://localhost:8081
```

### 3. First-time bootstrap (no project in DB yet)
```bash
curl -X POST "http://localhost:8000/setup"
```
Returns the raw API key — copy it, it's shown once. Then paste it into the frontend login screen.

## Core Concepts
- **Project** — top-level tenant (one per deployment, "DunnoAI")
- **Agent** — a logical AI assistant (e.g. "support-bot", "doc-analyzer")
- **Agent Version** — a specific config snapshot of an agent at a point in time
- **Person** — an end-user being tracked
- **Session** — a conversation thread grouping multiple events
- **Event** — a single LLM call (the atomic unit of tracking)
- **Fingerprint** — environment metadata (language, runtime, SDK version) attached to events

## Auth
All API endpoints require `X-API-Key: vk_live_...` header.
Keys are SHA-256 hashed before storage — raw key is shown once at creation.

## Environment Variables
See `backend/.env.example`. Critical ones:
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_KEY` — service role key (not anon key)
