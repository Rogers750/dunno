# Dunno — LLM Analytics for AI Agents

Track every LLM call your chatbot makes. See sessions, intents, corrections, resolution rates, and latency — all in one dashboard.

Inspired by [Voker](https://voker.ai). Self-hostable. Open source.

---

## What it does

You integrate the Dunno SDK into your chatbot with a one-line import swap. Every LLM call automatically sends:

- **Model, tokens, latency** per call
- **Full message history** per session
- **Intent detection** — what users are trying to do (Fix/Debug, Generate Content, Get Information, etc.)
- **Correction detection** — when users push back on the AI's response
- **Resolution tracking** — whether the session ended successfully

All of this appears in the dashboard without changing your LLM logic.

---

## Architecture

```
dunno_tracker/
├── backend/           # FastAPI REST API
│   ├── app/
│   │   ├── routers/   # agents, events, sessions, people, dashboard
│   │   ├── repositories/
│   │   │   ├── base.py           # Abstract interface
│   │   │   ├── supabase_repo.py  # Supabase (default)
│   │   │   ├── postgres_repo.py  # Direct PostgreSQL
│   │   │   └── clickhouse_repo.py # ClickHouse (events) + Postgres (relational)
│   │   └── analysis.py           # Intent / correction / resolution classifier
│   ├── supabase/schema.sql        # Supabase schema
│   ├── postgres/schema.sql        # Postgres schema
│   └── clickhouse/schema.sql      # ClickHouse tables (events + messages)
├── frontend/          # Expo React Native dashboard (web-first)
└── sdks/
    ├── python/        # pip install -e ./sdks/python
    └── typescript/    # npm install ./sdks/typescript
```

---

## Quick Start (Supabase — easiest)

### 1. Database

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste and run `backend/supabase/schema.sql`
3. Copy your **Project URL** and **Service Role Key** (Settings → API)

### 2. Backend

```bash
cd backend
cp .env.example .env
# Fill in SUPABASE_URL and SUPABASE_SERVICE_KEY
```

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Bootstrap — get your first API key

Run this **once** to create your project and API key:

```bash
curl -X POST http://localhost:8000/setup
```

Response:
```json
{
  "api_key": "dn_live_...",
  "message": "Save this API key — it will not be shown again."
}
```

**Copy the key immediately** — it's hashed before storage and cannot be recovered.

If you lose it, generate a new one:
```bash
cd backend && source .venv/bin/activate && python - <<'EOF'
from app.auth import generate_api_key
from app.repositories import get_repo

repo = get_repo()
project = repo._db.table("projects").select("id, name").limit(1).execute().data[0]
raw_key, prefix, key_hash = generate_api_key()
repo.insert_api_key(project["id"], "Recovery Key", prefix, key_hash)
print(f"New API key: {raw_key}")
EOF
```

### 4. Dashboard

```bash
cd frontend
npm install
npm run web   # Opens at http://localhost:8081
```

Sign in with your `dn_live_...` key.

### 5. Integrate the SDK

```bash
pip install -e ./sdks/python
export DUNNO_API_KEY=dn_live_...
```

```python
from dunno.ai.provider_anthropic import Anthropic

client = Anthropic()
response = client.messages.create(
    dunno_agent="my-chatbot",
    dunno_session="session-abc",   # unique per conversation
    dunno_person="user-123",       # optional: track per user
    model="claude-sonnet-4-5",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}]
)
```

Every LLM call now appears in your dashboard automatically.

---

## Database Options

Dunno supports three database backends. Set `DB_TYPE` in your `.env` to switch.

### Option 1 — Supabase (default, easiest)

No server to run. Hosted Postgres with a REST API.

```env
DB_TYPE=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

**Setup:**
1. Run `backend/supabase/schema.sql` in the Supabase SQL Editor

---

### Option 2 — PostgreSQL (self-hosted)

Full control. Run your own Postgres.

```env
DB_TYPE=postgres
POSTGRES_URL=postgresql://user:password@localhost:5432/dunno
```

**Setup:**
```bash
createdb dunno
psql $POSTGRES_URL -f backend/postgres/schema.sql
```

**Install dependency:**
```bash
pip install psycopg2-binary
```

---

### Option 3 — ClickHouse + PostgreSQL (for scale)

Best for high-volume analytics. Events and messages go to ClickHouse (fast aggregations). All relational data (agents, sessions, people, api_keys) stays on Postgres.

```env
DB_TYPE=clickhouse
POSTGRES_URL=postgresql://user:password@localhost:5432/dunno
CLICKHOUSE_HOST=localhost
CLICKHOUSE_PORT=8123
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=
CLICKHOUSE_DATABASE=dunno
```

**Setup:**
```bash
# Postgres (relational tables)
psql $POSTGRES_URL -f backend/postgres/schema.sql

# ClickHouse (events + messages)
clickhouse-client --host $CLICKHOUSE_HOST \
  --query "$(cat backend/clickhouse/schema.sql)"
```

**Install dependency:**
```bash
pip install psycopg2-binary clickhouse-connect
```

Why ClickHouse for events? It's column-oriented and built for append-only analytics. Token sums, latency averages, intent breakdowns — all 10-100x faster at scale than Postgres. The same architecture PostHog and Langfuse use.

---

## SDK Integration

### Python

**Install:**
```bash
# From local path
pip install -e ./sdks/python

# From GitHub
pip install "git+https://github.com/yourorg/dunno_tracker.git#subdirectory=sdks/python"

# With optional AI providers
pip install -e "./sdks/python[anthropic,openai,google]"
```

**Environment:**
```bash
export DUNNO_API_KEY=dn_live_...
export DUNNO_BASE_URL=http://localhost:8000  # default
```

**Anthropic (drop-in):**
```python
from dunno.ai.provider_anthropic import Anthropic

client = Anthropic()
response = client.messages.create(
    dunno_agent="my-chatbot",
    dunno_session="session-abc",
    dunno_person="user-123",
    model="claude-sonnet-4-5",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}]
)
```

**OpenAI (drop-in):**
```python
from dunno.ai.provider_openai import OpenAI

client = OpenAI()
response = client.chat.completions.create(
    dunno_agent="my-chatbot",
    dunno_session="session-abc",
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

**Gemini (drop-in):**
```python
from dunno.ai.provider_gemini import GenerativeModel

model = GenerativeModel("gemini-1.5-flash", dunno_agent="my-chatbot")
response = model.generate_content("Hello!", dunno_session="session-abc")
```

**Any LLM (manual):**
```python
from dunno import DunnoClient
from dunno.models import EventProperties
import time

client = DunnoClient()

start = time.monotonic()
response = your_llm_call(...)
latency_ms = int((time.monotonic() - start) * 1000)

client.events.create(
    event_name="llm",
    properties=EventProperties(
        model="your-model",
        input_tokens=100,
        output_tokens=50,
        latency_ms=latency_ms,
        messages=[{"role": "user", "content": "Hello!"}],
    ),
    session="session-abc",
    agent="my-chatbot",
)
client.close()  # flush on shutdown
```

---

### TypeScript

**Install:**
```bash
# From local path
npm install ./sdks/typescript

# From GitHub
npm install "github:yourorg/dunno_tracker#path=sdks/typescript"
```

**Environment:**
```bash
export DUNNO_API_KEY=dn_live_...
```

**Anthropic (drop-in):**
```typescript
import { Anthropic } from 'dunno/ai/provider-anthropic';

const client = new Anthropic();
const response = await client.messages.create({
    dunnoAgent: 'my-chatbot',
    dunnoSession: 'session-abc',
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'Hello!' }],
});
```

**OpenAI (drop-in):**
```typescript
import { OpenAI } from 'dunno/ai/provider-openai';

const client = new OpenAI();
await client.chat.completions.create({
    dunnoAgent: 'my-chatbot',
    dunnoSession: 'session-abc',
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: 'Hello!' }],
});
```

**Vercel AI SDK:**
```typescript
import { wrapAiSdk } from 'dunno/ai/ai-sdk';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

const result = await wrapAiSdk(
    generateText,
    { model: anthropic('claude-sonnet-4-5'), prompt: 'Hello!' },
    { dunnoAgent: 'my-chatbot', dunnoSession: 'session-abc' }
);
```

---

## Dashboard

| Screen | What you see |
|--------|-------------|
| **Dashboard** | Total events, sessions, people, agents, resolution rate, correction rate, avg latency, events over time chart, intent breakdown |
| **Sessions** | All conversation threads, click to drill in |
| **Session detail** | Token stats, resolution status, session path (intent sequence), detected intents, corrections, full message timeline |
| **Agents** | All registered agents and their versions |
| **People** | All tracked users and their session history |
| **Settings → API Keys** | Create / revoke keys |
| **Settings → SDK Setup** | Quickstart guide |

---

## Intent Analysis

Dunno automatically classifies each user message into an intent category using a keyword-pattern classifier (no secondary LLM call — fast and free).

| Intent | Triggered by |
|--------|-------------|
| **Get Information** | "what is", "explain", "how does", "tell me" |
| **Request Help** | "help me", "how do I", "can you help" |
| **Generate Content** | "write", "create", "generate", "draft", "build" |
| **Fix / Debug** | "fix", "error", "broken", "not working", "debug" |
| **Summarize** | "summarize", "summary", "tldr", "briefly" |
| **Analyze** | "analyze", "review", "evaluate", "assess" |
| **Compare** | "compare", "difference between", "vs", "versus" |

Casual conversation that doesn't match any category is silently ignored (not stored as "Other").

**Correction detection:** A user message that starts with "no", "actually", "that's wrong", etc. after an assistant reply is flagged as a correction.

**Resolution detection:** The last few messages are scanned for positive signals ("thanks", "perfect", "that works") or negative signals ("forget it", "useless") to determine if the session resolved successfully.

---

## Environment Variables

### Backend (`.env`)

| Variable | Required for | Description |
|----------|-------------|-------------|
| `DB_TYPE` | all | `supabase` (default), `postgres`, or `clickhouse` |
| `SUPABASE_URL` | supabase | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | supabase | Supabase service role key |
| `POSTGRES_URL` | postgres, clickhouse | PostgreSQL connection string |
| `CLICKHOUSE_HOST` | clickhouse | ClickHouse host (default: `localhost`) |
| `CLICKHOUSE_PORT` | clickhouse | ClickHouse HTTP port (default: `8123`) |
| `CLICKHOUSE_USER` | clickhouse | ClickHouse user (default: `default`) |
| `CLICKHOUSE_PASSWORD` | clickhouse | ClickHouse password |
| `CLICKHOUSE_DATABASE` | clickhouse | ClickHouse database (default: `dunno`) |
| `SECRET_KEY` | all | Random string for signing |
| `ALLOWED_ORIGINS` | all | CORS origins, comma-separated |

### Frontend (`.env`)

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_API_URL` | Backend URL (default: `http://localhost:8000`) |

### SDK

| Variable | Description |
|----------|-------------|
| `DUNNO_API_KEY` | Your project API key (`dn_live_...`) |
| `DUNNO_BASE_URL` | Backend URL (default: `http://localhost:8000`) |

---

## API Reference

All endpoints require `X-API-Key: dn_live_...` header.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/setup` | One-time bootstrap (creates project + first key) |
| `GET` | `/health` | Health check |
| `PUT` | `/api/v1/fingerprints` | Register SDK environment |
| `POST` | `/api/v1/events` | Track an LLM call |
| `GET` | `/api/v1/events` | List events |
| `GET` | `/api/v1/events/{id}` | Get single event |
| `PUT` | `/api/v1/agents` | Create / upsert agent |
| `GET` | `/api/v1/agents` | List agents |
| `GET` | `/api/v1/agents/{name}` | Get agent |
| `PUT` | `/api/v1/agents/{name}/agent-versions` | Create agent version |
| `GET` | `/api/v1/agents/{name}/agent-versions` | List agent versions |
| `PUT` | `/api/v1/people` | Create / upsert person |
| `GET` | `/api/v1/people` | List people |
| `GET` | `/api/v1/people/{id}` | Get person |
| `PUT` | `/api/v1/people/{id}` | Update person properties |
| `GET` | `/api/v1/sessions` | List sessions |
| `GET` | `/api/v1/sessions/{id}` | Get session with full analysis |
| `GET` | `/api/v1/dashboard` | Analytics summary |
| `GET` | `/api/v1/dashboard/api-keys` | List API keys |
| `POST` | `/api/v1/dashboard/api-keys` | Create API key |
| `DELETE` | `/api/v1/dashboard/api-keys/{id}` | Revoke API key |

---

## How it works

```
Your chatbot
    └── Dunno SDK (drop-in provider wrapper)
            └── Background thread — fires events async (never blocks your LLM call)
                    └── POST /api/v1/events
                            └── FastAPI backend
                                    ├── Stores event + messages in DB
                                    └── Background: runs intent/correction/resolution classifier
                                            └── Stores analysis in DB

Dashboard (Expo web)
    └── Reads from backend API
            └── Shows sessions, intents, rates, charts
```

The SDK never slows down your LLM calls — events are queued in a background thread and sent after the response is returned to your user.
