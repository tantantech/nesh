import type { AIProvider, ProviderOptions, StreamEvent } from './provider.js'
import { resolveProviderKey } from '../config.js'

export interface OpenAIProviderOptions {
  readonly providerName: string
  readonly displayName: string
  readonly baseURL: string
}

export function createOpenAIProvider(opts?: OpenAIProviderOptions): AIProvider {
  const providerName = opts?.providerName ?? 'openai'
  const displayName = opts?.displayName ?? 'OpenAI'
  const baseURL = opts?.baseURL ?? 'https://api.openai.com/v1'

  return {
    name: providerName,
    displayName,

    async *query(prompt: string, options: ProviderOptions): AsyncGenerator<StreamEvent> {
      // Ollama (local) needs no API key; all others do
      const apiKey = providerName === 'ollama'
        ? (resolveProviderKey('ollama') ?? 'ollama')
        : resolveProviderKey(providerName)

      if (!apiKey) {
        throw new Error(`${displayName} API key not configured. Run \`keys\` to add one, or set the appropriate env var.`)
      }

      const startTime = Date.now()

      // Lazy-load the OpenAI SDK
      const { default: OpenAI } = await import('openai')
      const client = new OpenAI({ apiKey, baseURL })

      const systemPrompt = options.systemPrompt ?? 'You are a helpful AI assistant running inside a terminal shell.'

      const stream = await client.chat.completions.create({
        model: options.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        stream: true,
      }, {
        signal: options.abortController?.signal,
      })

      let totalContent = ''

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta
        if (delta?.content) {
          totalContent += delta.content
          yield { type: 'text', content: delta.content }
        }
      }

      const durationMs = Date.now() - startTime
      // OpenAI streaming doesn't provide token counts inline; estimate from content
      const estimatedInputTokens = Math.ceil(prompt.length / 4)
      const estimatedOutputTokens = Math.ceil(totalContent.length / 4)

      yield {
        type: 'done',
        usage: {
          inputTokens: estimatedInputTokens,
          outputTokens: estimatedOutputTokens,
          costUsd: 0, // Cannot accurately estimate without pricing table
          durationMs,
        },
      }
    },
  }
}
