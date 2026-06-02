# Frontend — Expo React Native (Web-First Dashboard)

## Stack
- **Expo Router** — file-based routing (like Next.js App Router)
- **React Query** (`@tanstack/react-query`) — all data fetching and caching
- **Zustand** — global state (API key, project name)
- **AsyncStorage** — persists API key across sessions
- **Expo Vector Icons** — Ionicons throughout

## Running
```bash
npm install
npm run web      # http://localhost:8081
npm run ios      # iOS simulator
npm run android  # Android emulator
```

## Route Structure
```
app/
├── _layout.tsx                    # Root: QueryClient + loads API key from storage
├── index.tsx                      # Redirects → login or dashboard based on auth
├── (auth)/
│   └── login.tsx                  # API key entry screen
└── (dashboard)/
    ├── _layout.tsx                # Sidebar (web) or stack (mobile)
    ├── index.tsx                  # Dashboard — stat cards + bar chart
    ├── sessions/
    │   ├── index.tsx              # Session list
    │   └── [id].tsx               # Session detail + event timeline + messages
    ├── agents/
    │   ├── index.tsx              # Agent list
    │   └── [name].tsx             # Agent detail + version history
    ├── people/
    │   ├── index.tsx              # People list
    │   └── [id].tsx               # Person detail + properties + sessions
    └── settings/
        ├── index.tsx              # Settings menu
        ├── api-keys.tsx           # Create / revoke API keys
        ├── members.tsx            # Invite team members
        └── sdk-setup.tsx          # Quickstart guide (Python + TypeScript)
```

## Auth Pattern
- API key stored in `AsyncStorage` via `lib/store.ts` (Zustand)
- `lib/api.ts` reads the key from AsyncStorage on every request and sends it as `X-API-Key` header
- Login screen validates the key by calling `GET /api/v1/dashboard` — if it fails, key is cleared
- Sign out = clear AsyncStorage + redirect to login

## API Client (`lib/api.ts`)
Single `api` object with typed methods for every backend endpoint.
```ts
api.getDashboard(days, agentName?)
api.listSessions(limit, offset, agentName?)
api.getSession(sessionId)
api.listAgents()
api.getAgent(name)
api.listAgentVersions(agentName)
api.listPeople()
api.getPerson(personId)
api.listEvents(sessionId?, limit?)
api.listApiKeys()
api.createApiKey(name)
api.revokeApiKey(id)
```
Base URL from `EXPO_PUBLIC_API_URL` env var (default: `http://localhost:8000`).

## Key Components
```
components/
├── ui/
│   ├── Sidebar.tsx     # Left nav (web only) — highlights active route
│   └── StatCard.tsx    # Metric card with icon, value, subtitle
└── charts/
    └── BarChart.tsx    # Simple bar chart using plain View/StyleSheet (no deps)
```

## Layout Behaviour
- **Web**: `(dashboard)/_layout.tsx` renders `<Sidebar>` + `<Stack>` side by side
- **Mobile**: sidebar hidden, just `<Stack>` with back navigation

## Environment Variables
```
EXPO_PUBLIC_API_URL=http://localhost:8000
```
Copy from `.env.example`.
