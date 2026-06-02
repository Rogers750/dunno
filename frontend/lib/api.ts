import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

async function getApiKey(): Promise<string | null> {
  return AsyncStorage.getItem('dunno_api_key');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const apiKey = await getApiKey();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { 'X-API-Key': apiKey } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

export const api = {
  // Dashboard
  getDashboard: (days = 30, agentName?: string) => {
    const params = new URLSearchParams({ days: String(days) });
    if (agentName) params.set('agent_name', agentName);
    return request<DashboardData>(`/api/v1/dashboard?${params}`);
  },

  // API Keys
  listApiKeys: () => request<ApiKey[]>('/api/v1/dashboard/api-keys'),
  createApiKey: (name: string) =>
    request<{ key: string; prefix: string; name: string }>(`/api/v1/dashboard/api-keys?name=${encodeURIComponent(name)}`, {
      method: 'POST',
    }),
  revokeApiKey: (id: string) =>
    request(`/api/v1/dashboard/api-keys/${id}`, { method: 'DELETE' }),

  // Sessions
  listSessions: (limit = 50, offset = 0, agentName?: string) => {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    if (agentName) params.set('agent_name', agentName);
    return request<Session[]>(`/api/v1/sessions?${params}`);
  },
  getSession: (sessionId: string) => request<SessionDetail>(`/api/v1/sessions/${sessionId}`),

  // Agents
  listAgents: () => request<Agent[]>('/api/v1/agents'),
  getAgent: (name: string) => request<Agent>(`/api/v1/agents/${name}`),
  createAgent: (payload: { agent_name: string; description?: string }) =>
    request<Agent>('/api/v1/agents', { method: 'PUT', body: JSON.stringify(payload) }),
  listAgentVersions: (agentName: string) =>
    request<AgentVersion[]>(`/api/v1/agents/${agentName}/agent-versions`),

  // People
  listPeople: () => request<Person[]>('/api/v1/people'),
  getPerson: (personId: string) => request<Person>(`/api/v1/people/${personId}`),

  // Events
  listEvents: (sessionId?: string, limit = 50) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (sessionId) params.set('session_id', sessionId);
    return request<Event[]>(`/api/v1/events?${params}`);
  },
  getEvent: (eventId: string) => request<Event>(`/api/v1/events/${eventId}`),
};

// Types
export interface DashboardData {
  total_events: number;
  total_sessions: number;
  total_people: number;
  total_agents: number;
  avg_latency_ms: number;
  resolution_rate: number | null;
  correction_rate: number | null;
  intent_breakdown: { intent: string; display_name: string; weight: number }[];
  chart_data: { date: string; events: number }[];
}

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
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
}

export interface Person {
  id: string;
  person_id: string;
  properties: Record<string, unknown>;
  created_at: string;
}

export interface Session {
  id: string;
  session_id: string;
  created_at: string;
  updated_at: string;
  people: { person_id: string; properties: Record<string, unknown> } | null;
  agents: { agent_name: string } | null;
}

export interface Event {
  id: string;
  event_name: string;
  properties: Record<string, unknown>;
  model: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  latency_ms: number | null;
  created_at: string;
}

export interface Intent {
  intent: string;
  display_name: string;
  weight: number;
  msg_start: number;
  msg_end: number;
  created_at: string;
}

export interface Correction {
  msg_index: number | null;
  reason: string | null;
  created_at: string;
}

export interface Resolution {
  resolved: boolean;
  resolution_type: string;
  summary: string | null;
  created_at: string;
}

export interface SessionDetail extends Session {
  events: (Event & { messages: Message[]; agent_versions: { agent_version_name: string } | null })[];
  summary: string | null;
  intents: Intent[];
  session_path: string[];
  corrections: Correction[];
  resolution: Resolution | null;
  total_tokens: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_latency_ms: number;
}

export interface Message {
  id: string;
  role: string;
  content: string | null;
  tool_calls: unknown[] | null;
}
