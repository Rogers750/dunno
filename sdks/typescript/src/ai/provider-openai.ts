/**
 * Dunno-wrapped OpenAI client.
 * Usage: import { OpenAI } from '@dunno/dunno/ai/provider-openai'
 */
import type { DunnoClientOptions } from '../types.js';
import { DunnoClient } from '../client.js';

let _defaultClient: DunnoClient | null = null;

function getDefaultClient(options?: DunnoClientOptions): DunnoClient {
  if (!_defaultClient) _defaultClient = new DunnoClient(options);
  return _defaultClient;
}

export function createDunnoOpenAI(options?: DunnoClientOptions) {
  return (BaseOpenAI: any) => {
    const dunno = getDefaultClient(options);

    return class DunnoOpenAI extends BaseOpenAI {
      constructor(...args: any[]) {
        super(...args);
        const baseChatCompletions = (this as any).chat.completions;

        const wrappedCreate = async (params: any) => {
          const {
            dunnoAgent,
            dunnoSession,
            dunnoPerson,
            dunnoAgentVersion,
            ...rest
          } = params;

          const start = Date.now();
          const result = await baseChatCompletions.create(rest);
          const latencyMs = Date.now() - start;

          if (dunnoSession) {
            dunno.events.create({
              eventName: 'llm',
              properties: {
                model: result.model,
                inputTokens: result.usage?.prompt_tokens,
                outputTokens: result.usage?.completion_tokens,
                latencyMs,
                messages: rest.messages,
              },
              dunnoSession,
              dunnoAgent,
              dunnoAgentVersion,
              dunnoPerson,
            });
          }

          return result;
        };

        (this as any).chat = {
          completions: { create: wrappedCreate },
        };
      }
    };
  };
}

// Convenience: auto-wrap if openai is installed
export async function OpenAI(options?: DunnoClientOptions & { openaiOptions?: Record<string, unknown> }) {
  const { default: BaseOpenAI } = await import('openai');
  const Wrapped = createDunnoOpenAI(options)(BaseOpenAI);
  return new Wrapped(options?.openaiOptions);
}

// Static class form for synchronous usage
export class OpenAIClass {
  private _inner: any;
  private _dunno: DunnoClient;

  constructor(opts?: DunnoClientOptions) {
    this._dunno = getDefaultClient(opts);
    import('openai').then(({ default: BaseOpenAI }) => {
      this._inner = new BaseOpenAI();
    });
  }

  get chat() {
    const dunno = this._dunno;
    const inner = this._inner;
    return {
      completions: {
        create: async (params: any) => {
          const { dunnoAgent, dunnoSession, dunnoPerson, dunnoAgentVersion, ...rest } = params;
          const start = Date.now();
          const result = await inner.chat.completions.create(rest);
          const latencyMs = Date.now() - start;
          if (dunnoSession) {
            dunno.events.create({
              eventName: 'llm',
              properties: {
                model: result.model,
                inputTokens: result.usage?.prompt_tokens,
                outputTokens: result.usage?.completion_tokens,
                latencyMs,
                messages: rest.messages,
              },
              dunnoSession,
              dunnoAgent,
              dunnoAgentVersion,
              dunnoPerson,
            });
          }
          return result;
        },
      },
    };
  }
}

// Default export: the class
export { OpenAIClass as OpenAI };
