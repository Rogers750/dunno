/**
 * Dunno-wrapped Anthropic client.
 * Usage: import { Anthropic } from '@dunno/dunno/ai/provider-anthropic'
 */
import type { DunnoClientOptions } from '../types.js';
import { DunnoClient } from '../client.js';

let _defaultClient: DunnoClient | null = null;

function getDefaultClient(opts?: DunnoClientOptions): DunnoClient {
  if (!_defaultClient) _defaultClient = new DunnoClient(opts);
  return _defaultClient;
}

export class Anthropic {
  private _inner: any = null;
  private _dunno: DunnoClient;

  constructor(opts?: DunnoClientOptions) {
    this._dunno = getDefaultClient(opts);
    import('@anthropic-ai/sdk').then(({ default: BaseAnthropic }) => {
      this._inner = new BaseAnthropic();
    });
  }

  get messages() {
    const dunno = this._dunno;
    const inner = this._inner;
    return {
      create: async (params: any) => {
        const { dunnoAgent, dunnoSession, dunnoPerson, dunnoAgentVersion, ...rest } = params;
        const start = Date.now();
        const result = await inner.messages.create(rest);
        const latencyMs = Date.now() - start;
        if (dunnoSession) {
          const msgs = rest.system
            ? [{ role: 'system', content: rest.system }, ...(rest.messages ?? [])]
            : rest.messages ?? [];
          dunno.events.create({
            eventName: 'llm',
            properties: {
              model: result.model,
              inputTokens: result.usage?.input_tokens,
              outputTokens: result.usage?.output_tokens,
              latencyMs,
              messages: msgs,
            },
            dunnoSession,
            dunnoAgent,
            dunnoAgentVersion,
            dunnoPerson,
          });
        }
        return result;
      },
    };
  }
}
