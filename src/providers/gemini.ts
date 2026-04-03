import type { AIProvider, ProviderOptions, StreamEvent } from './provider.js'
import { resolveProviderKey } from '../config.js'

export function createGeminiProvider(): AIProvider {
  return {
    name: 'google',
    displayName: 'Google',

    async *query(prompt: string, options: ProviderOptions): AsyncGenerator<StreamEvent> {
      const apiKey = resolveProviderKey('google')
      if (!apiKey) {
        throw new Error('Google API key not configured. Run `keys` to add one, or set GOOGLE_API_KEY.')
      }

      const startTime = Date.now()

      // Lazy-load the Gemini SDK
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: options.model })

      const systemPrompt = options.systemPrompt ?? 'You are a helpful AI assistant running inside a terminal shell.'

      const result = await model.generateContentStream({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: { role: 'model', parts: [{ text: systemPrompt }] },
      })

      let totalContent = ''
      let usageMetadata: { promptTokenCount?: number; candidatesTokenCount?: number } | undefined

      for await (const chunk of result.stream) {
        const text = chunk.text()
        if (text) {
          totalContent += text
          yield { type: 'text', content: text }
        }
        if (chunk.usageMetadata) {
          usageMetadata = chunk.usageMetadata
        }
      }

      const durationMs = Date.now() - startTime
      yield {
        type: 'done',
        usage: {
          inputTokens: usageMetadata?.promptTokenCount ?? Math.ceil(prompt.length / 4),
          outputTokens: usageMetadata?.candidatesTokenCount ?? Math.ceil(totalContent.length / 4),
          costUsd: 0, // Gemini pricing varies; not estimated here
          durationMs,
        },
      }
    },
  }
}
