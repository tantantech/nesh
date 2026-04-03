import type { AIProvider, ProviderOptions, StreamEvent } from './provider.js'
import { buildSystemPrompt, createCanUseTool, toSDKPermissionMode, buildExplainPrompt } from '../ai.js'
import { buildResumeOptions } from '../session.js'
import { extractUsage } from '../cost.js'
import type { NeshPermission, LastError } from '../types.js'
import type { ProjectContext } from '../context.js'

interface SDKStreamEvent {
  readonly type: string
  readonly content_block?: {
    readonly type: string
    readonly name?: string
  }
  readonly delta?: {
    readonly type: string
    readonly text?: string
  }
}

interface SDKMessage {
  readonly type: string
  readonly event?: SDKStreamEvent
  readonly error?: string
  readonly is_error?: boolean
  readonly parent_tool_use_id?: string | null
}

export function createClaudeProvider(): AIProvider {
  return {
    name: 'claude',
    displayName: 'Anthropic',

    async *query(prompt: string, options: ProviderOptions): AsyncGenerator<StreamEvent> {
      const sdk = await import('@anthropic-ai/claude-agent-sdk')

      const isExplain = prompt === 'explain' || prompt === 'why'
      const fullPrompt = isExplain && options.lastError
        ? buildExplainPrompt(options.lastError as LastError)
        : prompt

      const requestedMode = (options.permissionMode ?? 'auto') as NeshPermission
      const effectiveMode: NeshPermission = (requestedMode === 'ask' && !process.stdin.isTTY)
        ? 'auto'
        : requestedMode

      const systemPrompt = options.systemPrompt ?? buildSystemPrompt(
        options.cwd ?? process.cwd(),
        options.projectContext as ProjectContext | null | undefined,
      )

      const startTime = Date.now()

      const stream = sdk.query({
        prompt: fullPrompt,
        options: {
          abortController: options.abortController,
          includePartialMessages: true,
          allowedTools: ['Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep'],
          permissionMode: toSDKPermissionMode(effectiveMode) as 'acceptEdits' | 'default' | 'plan',
          cwd: options.cwd ?? process.cwd(),
          systemPrompt,
          ...buildResumeOptions(options.sessionId),
          model: options.model,
          ...(effectiveMode === 'ask' && options.canUseTool ? { canUseTool: options.canUseTool } : {}),
        },
      })

      let capturedSessionId: string | undefined
      let capturedUsage: { inputTokens: number; outputTokens: number; costUsd: number; durationMs: number } | undefined

      for await (const message of stream) {
        const msg = message as SDKMessage

        if (msg.type === 'stream_event' && msg.event) {
          const event = msg.event

          if (
            event.type === 'content_block_start' &&
            event.content_block?.type === 'tool_use' &&
            event.content_block.name
          ) {
            yield { type: 'tool_start', name: event.content_block.name }
          } else if (
            event.type === 'content_block_delta' &&
            event.delta?.type === 'text_delta' &&
            event.delta.text
          ) {
            yield { type: 'text', content: event.delta.text }
          } else if (event.type === 'content_block_stop') {
            yield { type: 'tool_end', name: '' }
          }
        } else if (msg.type === 'result' && !msg.is_error) {
          const resultMsg = msg as unknown as Record<string, unknown>
          try {
            if (typeof resultMsg.session_id === 'string') {
              capturedSessionId = resultMsg.session_id
            }
            if (resultMsg.usage && typeof resultMsg.total_cost_usd === 'number' && typeof resultMsg.duration_ms === 'number') {
              const usage = extractUsage(resultMsg as {
                readonly usage: { readonly input_tokens: number; readonly output_tokens: number }
                readonly total_cost_usd: number
                readonly duration_ms: number
              })
              capturedUsage = usage
            }
          } catch {
            // Usage extraction failed -- non-fatal
          }
        }
      }

      const durationMs = Date.now() - startTime
      yield {
        type: 'done',
        usage: capturedUsage ?? {
          inputTokens: 0,
          outputTokens: 0,
          costUsd: 0,
          durationMs,
        },
        ...(capturedSessionId ? { sessionId: capturedSessionId } : {}),
      } as StreamEvent & { sessionId?: string }
    },
  }
}
