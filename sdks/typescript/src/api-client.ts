import type {
  Agent,
  AgentVersion,
  CreateAgentPayload,
  CreateAgentVersionPayload,
  CreatePersonPayload,
  EventProperties,
  Fingerprint,
  Person,
  UpdatePersonPayload,
  DunnoClientOptions,
} from './types.js';

const DEFAULT_BASE_URL = 'http://localhost:8000';

export class ApiClientAgents {
  constructor(private readonly http: (path: string, init?: RequestInit) => Promise<Response>) {}

  async create(payload: CreateAgentPayload): Promise<Agent> {
    const r = await this.http('/api/v1/agents', {
      method: 'PUT',
      body: JSON.stringify({ agent_name: payload.agentName, description: payload.description }),
    });
    return r.json();
  }

  async get(agentName: string): Promise<Agent> {
    const r = await this.http(`/api/v1/agents/${agentName}`);
    return r.json();
  }
}

export class ApiClientAgentVersions {
  constructor(private readonly http: (path: string, init?: RequestInit) => Promise<Response>) {}

  async create(agentName: string, payload: CreateAgentVersionPayload): Promise<AgentVersion> {
    const r = await this.http(`/api/v1/agents/${agentName}/agent-versions`, {
      method: 'PUT',
      body: JSON.stringify({ agent_version_name: payload.agentVersionName, description: payload.description }),
    });
    return r.json();
  }

  async get(agentName: string, agentVersionName: string): Promise<AgentVersion> {
    const r = await this.http(`/api/v1/agents/${agentName}/agent-versions/${agentVersionName}`);
    return r.json();
  }
}

export class ApiClientPeople {
  constructor(private readonly http: (path: string, init?: RequestInit) => Promise<Response>) {}

  async create(payload: CreatePersonPayload): Promise<Person> {
    const r = await this.http('/api/v1/people', {
      method: 'PUT',
      body: JSON.stringify({ person_id: payload.personId, properties: payload.properties ?? {} }),
    });
    return r.json();
  }

  async get(personId: string): Promise<Person> {
    const r = await this.http(`/api/v1/people/${personId}`);
    return r.json();
  }

  async update(personId: string, payload: UpdatePersonPayload): Promise<Person> {
    const r = await this.http(`/api/v1/people/${personId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return r.json();
  }
}

export class ApiClientFingerprints {
  constructor(private readonly http: (path: string, init?: RequestInit) => Promise<Response>) {}

  async create(): Promise<Fingerprint> {
    const r = await this.http('/api/v1/fingerprints', {
      method: 'PUT',
      body: JSON.stringify({
        language: 'typescript',
        language_version: process.version ?? 'unknown',
        sdk_version: '0.1.0',
        system: process.platform ?? 'unknown',
      }),
    });
    return r.json();
  }
}

export class ApiClientEvents {
  constructor(private readonly http: (path: string, init?: RequestInit) => Promise<Response>) {}

  async create(options: {
    eventName: string;
    properties: EventProperties;
    session: string;
    fingerprintId: string;
    agent?: string;
    agentVersion?: string;
    person?: string;
  }): Promise<void> {
    await this.http('/api/v1/events', {
      method: 'POST',
      body: JSON.stringify({
        event_name: options.eventName,
        properties: {
          model: options.properties.model,
          input_tokens: options.properties.inputTokens,
          output_tokens: options.properties.outputTokens,
          latency_ms: options.properties.latencyMs,
          messages: options.properties.messages,
        },
        session: options.session,
        fingerprint_id: options.fingerprintId,
        agent: options.agent,
        agent_version: options.agentVersion,
        person: options.person,
      }),
    });
  }
}

export class ApiClient {
  readonly agents: ApiClientAgents;
  readonly agentVersions: ApiClientAgentVersions;
  readonly people: ApiClientPeople;
  readonly fingerprints: ApiClientFingerprints;
  readonly events: ApiClientEvents;

  private readonly _apiKey: string;
  private readonly _baseUrl: string;

  constructor(options: DunnoClientOptions = {}) {
    this._apiKey = options.apiKey ?? process.env['VOKER_API_KEY'] ?? '';
    this._baseUrl = options.baseUrl ?? process.env['VOKER_BASE_URL'] ?? DEFAULT_BASE_URL;

    const http = this._fetch.bind(this);
    this.agents = new ApiClientAgents(http);
    this.agentVersions = new ApiClientAgentVersions(http);
    this.people = new ApiClientPeople(http);
    this.fingerprints = new ApiClientFingerprints(http);
    this.events = new ApiClientEvents(http);
  }

  private async _fetch(path: string, init: RequestInit = {}): Promise<Response> {
    const r = await fetch(`${this._baseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this._apiKey,
        ...(init.headers as Record<string, string> | undefined),
      },
    });
    if (!r.ok) {
      const body = await r.json().catch(() => ({ detail: r.statusText }));
      throw new Error(body.detail ?? `HTTP ${r.status}`);
    }
    return r;
  }
}
