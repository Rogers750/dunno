/**
 * Dunno wrapper for Vercel AI SDK.
 * Usage: import { wrapAiSdk } from '@dunno/dunno/ai/ai-sdk'
 */
import type { DunnoClientOptions } from '../types.js';
import { DunnoClient } from '../client.js';

let _defaultClient: DunnoClient | null = null;

function getDefaultClient(opts?: DunnoClientOptions): DunnoClient {
  if (!_defaultClient) _defaultClient = new DunnoClient(opts);
  return _defaultClient;
}

export interface WrapOptions extends DunnoClientOptions {
  dunnoAgent?: string;
  dunnoSession: string;
  dunnoPerson?: string;
  dunnoAgentVersion?: string;
}

/**
 * Wrap the AI SDK generateText function.
 * @example
 * const { text } = await wrapAiSdk(generateText, {
 *   dunnoAgent: 'my-agent',
 *   dunnoSession: 'session-1',
 *   model: anthropic('claude-sonnet-4.5'),
 *   prompt: 'Hello!',
 * });
 */
export async function wrapAiSdk<T>(
  fn: (params: any) => Promise<T>,
  params: any,
  dunnoOptions: WrapOptions,
): Promise<T> {
  const dunno = getDefaultClient(dunnoOptions);
  const start = Date.now();
  const result = await fn(params);
  const latencyMs = Date.now() - start;

  const steps = (result as any)?.steps;
  if (steps && dunnoOptions.dunnoSession) {
    for (const step of steps) {
      const usage = step.usage;
      dunno.events.create({
        eventName: 'llm',
        properties: {
          model: step.response?.modelId ?? params.model?.modelId,
          inputTokens: usage?.promptTokens,
          outputTokens: usage?.completionTokens,
          latencyMs,
          messages: step.messages ?? params.messages,
        },
        dunnoSession: dunnoOptions.dunnoSession,
        dunnoAgent: dunnoOptions.dunnoAgent,
        dunnoAgentVersion: dunnoOptions.dunnoAgentVersion,
        dunnoPerson: dunnoOptions.dunnoPerson,
      });
    }
  }

  return result;
}
