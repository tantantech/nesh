export type StreamEvent =
  | { readonly type: 'text'; readonly content: string }
  | { readonly type: 'tool_start'; readonly name: string }
  | { readonly type: 'tool_end'; readonly name: string; readonly result?: string }
  | { readonly type: 'done'; readonly usage?: UsageInfo }

export interface UsageInfo {
  readonly inputTokens: number
  readonly outputTokens: number
  readonly costUsd: number
  readonly durationMs: number
}

export interface ProviderOptions {
  readonly model: string
  readonly sessionId?: string
  readonly abortController?: AbortController
  readonly systemPrompt?: string
  readonly permissionMode?: string
  readonly cwd?: string
  readonly lastError?: { readonly command: string; readonly stderr: string; readonly exitCode: number }
  readonly projectContext?: { readonly summary: string } | null
  readonly canUseTool?: (
    toolName: string,
    input: Record<string, unknown>,
    options: { signal: AbortSignal; title?: string; displayName?: string; description?: string; toolUseID: string }
  ) => Promise<{ behavior: 'allow'; updatedInput?: Record<string, unknown> } | { behavior: 'deny'; message: string }>
}

export interface AIProvider {
  readonly name: string
  readonly displayName: string
  query(prompt: string, options: ProviderOptions): AsyncGenerator<StreamEvent>
}
