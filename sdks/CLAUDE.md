# SDKs — Python + TypeScript

Both SDKs follow the same architecture: wrap the provider's native client, intercept the response, and fire an event to the backend asynchronously without blocking the caller.

---

## Python SDK (`python/`)

### Install (local dev)
```bash
pip install -e ".[openai,anthropic,google]"
export DUNNO_API_KEY=vk_live_...
```

### File Structure
```
dunno/
├── __init__.py            # exports DunnoClient, ApiClient
├── models.py              # dataclasses: Agent, Person, Fingerprint, EventProperties
├── client.py              # DunnoClient — background thread, fire-and-forget
├── api_client.py          # ApiClient — synchronous direct API access
└── ai/
    ├── provider_openai.py     # wraps openai.OpenAI
    ├── provider_anthropic.py  # wraps anthropic.Anthropic
    └── provider_gemini.py     # wraps google.generativeai.GenerativeModel
```

### Two Client Types

**`DunnoClient`** — use this in production code. Events are queued and sent in a background thread so LLM calls are never slowed down.
```python
from dunno import DunnoClient
client = DunnoClient()
# queue an event (non-blocking)
client.events.create(event_name="llm", properties=..., session="s1", agent="my-agent")
client.close()  # flushes queue on shutdown
```

**`ApiClient`** — synchronous, use for scripts or when you need the response.
```python
from dunno import ApiClient
client = ApiClient()
agent = client.agents.create("my-agent")
fp = client.fingerprints.create()
```

### Provider Wrappers
Drop-in replacements — just change the import:

```python
# OpenAI
from dunno.ai.provider_openai import OpenAI
client = OpenAI()
client.chat.completions.create(
    dunno_agent="my-agent",
    dunno_session="session-1",
    model="gpt-4o-mini",
    messages=[...]
)

# Anthropic
from dunno.ai.provider_anthropic import Anthropic
client = Anthropic()
client.messages.create(
    dunno_agent="my-agent",
    dunno_session="session-1",
    model="claude-sonnet-4-5",
    max_tokens=1024,
    messages=[...]
)

# Gemini
from dunno.ai.provider_gemini import GenerativeModel
model = GenerativeModel("gemini-1.5-flash", dunno_agent="my-agent")
model.generate_content("Hello!", dunno_session="session-1")
```

### How Wrapping Works
1. Subclass the provider's base class
2. Override `chat.completions` (OpenAI), `messages` (Anthropic), or `generate_content` (Gemini)
3. Call the original method, measure latency
4. Extract `model`, `input_tokens`, `output_tokens` from response
5. Call `dunno_client.events.create(...)` — queued, never blocks

---

## TypeScript SDK (`typescript/`)

### Install (local dev)
```bash
npm install
npm run build
export DUNNO_API_KEY=vk_live_...
```

### File Structure
```
src/
├── index.ts               # exports DunnoClient, ApiClient + all types
├── types.ts               # TypeScript interfaces
├── client.ts              # DunnoClient — interval-based flush queue
├── api-client.ts          # ApiClient — direct async fetch
└── ai/
    ├── provider-openai.ts     # wraps openai
    ├── provider-anthropic.ts  # wraps @anthropic-ai/sdk
    └── ai-sdk.ts              # wrapAiSdk() for Vercel AI SDK
```

### Two Client Types

**`DunnoClient`** — non-blocking. Events are batched and flushed every 500ms.
```typescript
import { DunnoClient } from 'dunno';
const client = new DunnoClient();
client.events.create({ eventName: 'llm', properties: {...}, dunnoSession: 's1' });
await client.close(); // flush on shutdown
```

**`ApiClient`** — direct async fetch, use when you need the response.
```typescript
import { ApiClient } from 'dunno';
const client = new ApiClient();
const agent = await client.agents.create({ agentName: 'my-agent' });
```

### Provider Wrappers

```typescript
// OpenAI
import { OpenAI } from 'dunno/ai/provider-openai';
const client = new OpenAI();
await client.chat.completions.create({
    dunnoAgent: 'my-agent',
    dunnoSession: 'session-1',
    model: 'gpt-4o-mini',
    messages: [...]
});

// Anthropic
import { Anthropic } from 'dunno/ai/provider-anthropic';
const client = new Anthropic();
await client.messages.create({
    dunnoAgent: 'my-agent',
    dunnoSession: 'session-1',
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    messages: [...]
});

// Vercel AI SDK
import { wrapAiSdk } from 'dunno/ai/ai-sdk';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

const result = await wrapAiSdk(
    generateText,
    { model: anthropic('claude-sonnet-4-5'), prompt: 'Hello!' },
    { dunnoAgent: 'my-agent', dunnoSession: 'session-1' }
);
```

### How Wrapping Works
1. Intercept the provider method call
2. Destructure `dunnoAgent`, `dunnoSession`, `dunnoPerson`, `dunnoAgentVersion` from params
3. Pass the remaining params to the real provider
4. On response: extract model/tokens/latency, call `dunnoClient.events.create(...)` — queued, non-blocking
5. Return the original response unchanged

---

## Event Properties Reference
```
model          string   — LLM model name (e.g. "gpt-4o-mini")
input_tokens   int      — prompt token count
output_tokens  int      — completion token count
latency_ms     int      — wall-clock time for the LLM call
messages       array    — full message history [{role, content}]
tool_calls     array    — tool call objects if any
```
