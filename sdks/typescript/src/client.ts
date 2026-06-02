import type {
  ClientCreateEventPayload,
  CreateAgentPayload,
  CreateAgentVersionPayload,
  CreatePersonPayload,
  UpdatePersonPayload,
  DunnoClientOptions,
} from './types.js';

const DEFAULT_BASE_URL = 'http://localhost:8000';

interface QueueItem {
  path: string;
  method: string;
  body: unknown;
}

export class DunnoClientEvents {
  constructor(private readonly _client: DunnoClient) {}

  create(payload: ClientCreateEventPayload): void {
    this._client._enqueue({
      path: '/api/v1/events',
      method: 'POST',
      body: {
        event_name: payload.eventName,
        properties: {
          model: payload.properties.model,
          input_tokens: payload.properties.inputTokens,
          output_tokens: payload.properties.outputTokens,
          latency_ms: payload.properties.latencyMs,
          messages: payload.properties.messages,
        },
        session: payload.dunnoSession,
        agent: payload.dunnoAgent,
        agent_version: payload.dunnoAgentVersion,
        person: payload.dunnoPerson,
        fingerprint_id: this._client._fingerprintId,
      },
    });
  }
}

export class DunnoClientPeople {
  constructor(private readonly _client: DunnoClient) {}

  create(payload: CreatePersonPayload): void {
    this._client._enqueue({
      path: '/api/v1/people',
      method: 'PUT',
      body: { person_id: payload.personId, properties: payload.properties ?? {} },
    });
  }

  update(personId: string, payload: UpdatePersonPayload): void {
    this._client._enqueue({
      path: `/api/v1/people/${personId}`,
      method: 'PUT',
      body: payload,
    });
  }
}

export class DunnoClientAgents {
  constructor(private readonly _client: DunnoClient) {}

  create(payload: CreateAgentPayload): void {
    this._client._enqueue({
      path: '/api/v1/agents',
      method: 'PUT',
      body: { agent_name: payload.agentName, description: payload.description },
    });
  }
}

export class DunnoClientAgentVersions {
  constructor(private readonly _client: DunnoClient) {}

  create(agentName: string, payload: CreateAgentVersionPayload): void {
    this._client._enqueue({
      path: `/api/v1/agents/${agentName}/agent-versions`,
      method: 'PUT',
      body: { agent_version_name: payload.agentVersionName, description: payload.description },
    });
  }
}

export class DunnoClient {
  readonly events: DunnoClientEvents;
  readonly people: DunnoClientPeople;
  readonly agents: DunnoClientAgents;
  readonly agentVersions: DunnoClientAgentVersions;

  _fingerprintId: string | null = null;

  private readonly _apiKey: string;
  private readonly _baseUrl: string;
  private readonly _queue: QueueItem[] = [];
  private _flushTimer: ReturnType<typeof setInterval> | null = null;
  private _starting: Promise<void> | null = null;

  constructor(options: DunnoClientOptions = {}) {
    this._apiKey = options.apiKey ?? process.env['DUNNO_API_KEY'] ?? '';
    this._baseUrl = options.baseUrl ?? process.env['DUNNO_BASE_URL'] ?? DEFAULT_BASE_URL;

    this.events = new DunnoClientEvents(this);
    this.people = new DunnoClientPeople(this);
    this.agents = new DunnoClientAgents(this);
    this.agentVersions = new DunnoClientAgentVersions(this);

    this._starting = this._init();
  }

  private async _init(): Promise<void> {
    try {
      const r = await this._fetch('/api/v1/fingerprints', 'PUT', {
        language: 'typescript',
        language_version: process.version ?? 'unknown',
        sdk_version: '0.1.0',
        system: process.platform ?? 'unknown',
      });
      this._fingerprintId = r?.fingerprint_id ?? null;
    } catch {
      // Non-fatal
    }
    this._flushTimer = setInterval(() => this._flush(), 500);
  }

  _enqueue(item: QueueItem): void {
    this._queue.push(item);
  }

  private async _flush(): Promise<void> {
    const batch = this._queue.splice(0);
    await Promise.allSettled(batch.map((item) => this._fetch(item.path, item.method, item.body)));
  }

  private async _fetch(path: string, method: string, body?: unknown): Promise<any> {
    const r = await fetch(`${this._baseUrl}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', 'X-API-Key': this._apiKey },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!r.ok) return null;
    return r.json().catch(() => null);
  }

  async close(): Promise<void> {
    await this._starting;
    if (this._flushTimer) {
      clearInterval(this._flushTimer);
      this._flushTimer = null;
    }
    await this._flush();
  }
}
