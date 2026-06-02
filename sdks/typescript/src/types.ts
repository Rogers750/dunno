export interface EventProperties {
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  latencyMs?: number;
  messages?: Array<{ role: string; content?: string; tool_calls?: unknown[] }>;
  toolCalls?: unknown[];
  extra?: Record<string, unknown>;
}

export interface CreateAgentPayload {
  agentName: string;
  description?: string;
}

export interface CreateAgentVersionPayload {
  agentVersionName: string;
  description?: string;
  model?: string;
}

export interface CreatePersonPayload {
  personId: string;
  properties?: Record<string, unknown>;
}

export interface UpdatePersonPayload {
  properties: Record<string, unknown>;
}

export interface ClientCreateEventPayload {
  eventName: string;
  properties: EventProperties;
  dunnoSession: string;
  dunnoAgent?: string;
  dunnoAgentVersion?: string;
  dunnoPerson?: string;
}

export interface Agent {
  id: string;
  agent_name: string;
  description: string | null;
  agent_number: number | null;
  created_at: string;
  deprecated_at: string | null;
}

export interface AgentVersion {
  id: string;
  agent_version_name: string;
  description: string | null;
  agent_version_number: number | null;
  model: string | null;
  created_at: string;
  deprecated_at: string | null;
}

export interface Person {
  id: string;
  person_id: string;
  properties: Record<string, unknown>;
  created_at: string;
}

export interface Fingerprint {
  fingerprint_id: string;
  language: string;
  language_version: string | null;
  sdk_version: string | null;
  system: string;
  created_at: string;
}

export interface DunnoClientOptions {
  apiKey?: string;
  baseUrl?: string;
}
