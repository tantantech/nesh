---
phase: quick
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/templates.ts
  - src/prompt.ts
  - src/config.ts
  - src/types.ts
  - src/classify.ts
  - src/builtins.ts
  - src/shell.ts
  - tests/prompt.test.ts
  - tests/templates.test.ts
autonomous: true
requirements: [TMPL-01, TMPL-02, TMPL-03, TMPL-04]

must_haves:
  truths:
    - "User can type 'theme' at the prompt and see a list of available templates"
    - "User can select a template by number and prompt updates immediately"
    - "Selected template persists in ~/.claudeshell/config.json across restarts"
    - "All templates except 'powerline' render correctly without Nerd Font installation"
    - "Current p10k-style prompt is preserved as the 'powerline' template"
  artifacts:
    - path: "src/templates.ts"
      provides: "Template definitions and selection logic"
      exports: ["PromptTemplate", "TEMPLATES", "selectTemplateInteractive", "buildPromptFromTemplate"]
    - path: "src/config.ts"
      provides: "Template persistence in config"
      contains: "prompt_template"
    - path: "tests/templates.test.ts"
      provides: "Template unit tests"
  key_links:
    - from: "src/shell.ts"
      to: "src/builtins.ts"
      via: "theme builtin command handler"
      pattern: "case 'theme'"
    - from: "src/builtins.ts"
      to: "src/templates.ts"
      via: "selectTemplateInteractive call"
      pattern: "selectTemplateInteractive"
    - from: "src/shell.ts"
      to: "src/prompt.ts"
      via: "buildPrompt uses active template"
      pattern: "buildPrompt.*template"
    - from: "src/config.ts"
      to: "src/templates.ts"
      via: "persisted template name loaded on startup"
      pattern: "prompt_template"
---

<objective>
Add an interactive prompt template selector with a built-in library of 5 templates. Users type `theme` to pick a style. The choice persists in config.

Purpose: Let users personalize their shell experience without requiring special font installations.
Output: New `src/templates.ts` with template definitions, updated builtins/config/prompt/shell, tests.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/prompt.ts
@src/config.ts
@src/types.ts
@src/classify.ts
@src/builtins.ts
@src/shell.ts
@tests/prompt.test.ts

<interfaces>
<!-- Key types and contracts the executor needs -->

From src/types.ts:
```typescript
export type BuiltinName = 'cd' | 'exit' | 'quit' | 'clear' | 'export'

export interface ShellState {
  readonly cdState: CdState
  readonly running: boolean
  readonly lastError: LastError | undefined
  readonly aiStreaming: boolean
}
```

From src/classify.ts:
```typescript
const BUILTINS: ReadonlySet<string> = new Set(['cd', 'exit', 'quit', 'clear', 'export'])
export function classifyInput(line: string): InputAction
```

From src/config.ts:
```typescript
export interface ClaudeShellConfig {
  readonly api_key?: string
  readonly model?: string
  readonly history_size?: number
}
export const CONFIG_DIR: string   // ~/.claudeshell
export const CONFIG_PATH: string  // ~/.claudeshell/config.json
export function loadConfig(): ClaudeShellConfig
export function ensureConfigDir(): void
```

From src/prompt.ts:
```typescript
export function abbreviatePath(cwd: string, homedir: string): string
export function getGitBranch(): string
export function buildPrompt(cwd: string, homedir: string): string
```

From src/builtins.ts:
```typescript
export function executeCd(args: string, cdState: CdState): { newState: CdState; output?: string; error?: string }
export function executeExport(args: string): string | undefined
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Create template library and prompt builder</name>
  <files>src/templates.ts, tests/templates.test.ts, src/prompt.ts</files>
  <behavior>
    - getTemplateByName('minimal') returns the minimal template object
    - getTemplateByName('nonexistent') returns undefined
    - TEMPLATES array contains exactly 5 templates: minimal, classic, powerline, hacker, pastel
    - buildPromptFromTemplate with 'minimal' template produces prompt containing cwd and '>' but NO powerline glyphs (\uE0B0)
    - buildPromptFromTemplate with 'powerline' template produces prompt containing '\uE0B0' (the existing behavior)
    - buildPromptFromTemplate with 'hacker' template uses green coloring (ANSI color 2 or 34 or 46)
    - All templates produce prompts ending with a trailing space
    - All templates include git branch when getGitBranch returns non-empty
    - abbreviatePath is reused from prompt.ts (not duplicated)
  </behavior>
  <action>
Create `src/templates.ts` with:

1. A `PromptTemplate` interface:
   ```typescript
   interface PromptTemplate {
     readonly name: string           // e.g., 'minimal'
     readonly label: string          // e.g., 'Minimal'
     readonly description: string    // e.g., 'Clean and simple, no special characters'
     readonly requiresNerdFont: boolean
   }
   ```

2. A `TEMPLATES` array with 5 templates. Each template has a `buildPrompt(cwd, homedir)` method (or a standalone builder keyed by name). Templates:

   - **minimal**: Plain ASCII. Format: `claudeshell ~/Projects > `. Uses dim gray for shell name, default color for path, no separators. Git branch in parentheses: `(main)`.
   
   - **classic**: Box-drawing characters (U+2500 family). Format: `[claudeshell] ─ ~/Projects ─ (main) ─▸ `. Uses cyan (ANSI 6) for brackets, white for text.
   
   - **powerline** (requiresNerdFont: true): The EXISTING prompt from `src/prompt.ts` — orange/dark-orange segments with `\uE0B0` separators. Move the current `buildPrompt` logic here. Label clearly: "Requires Nerd Font".
   
   - **hacker**: Green-on-black terminal aesthetic. Format: `┌─[claudeshell]─[~/Projects]─[main]\n└──╼ `. Uses green (ANSI 2) throughout. Two-line prompt with box-drawing.
   
   - **pastel**: Soft colored sections with Unicode bullet separators. Format: `● claudeshell │ ~/Projects │ main ❯ `. Uses pastel purple (ANSI 141) for bullet, blue (ANSI 111) for path, pink (ANSI 218) for branch.

3. Export: `getTemplateByName(name: string): PromptTemplate | undefined`
4. Export: `buildPromptFromTemplate(template: PromptTemplate, cwd: string, homedir: string): string`
5. Export: `DEFAULT_TEMPLATE_NAME = 'minimal'` (safe default for all terminals)

Refactor `src/prompt.ts`:
- Keep `abbreviatePath` and `getGitBranch` as exported utilities (they are tested and used)
- Change `buildPrompt(cwd, homedir)` to accept an optional template name parameter: `buildPrompt(cwd: string, homedir: string, templateName?: string): string`
- When templateName is provided, delegate to `buildPromptFromTemplate`. When omitted, use DEFAULT_TEMPLATE_NAME for backward compat.
- Import from templates.ts

Create `tests/templates.test.ts` with tests for all behaviors listed above. Run tests RED first, then implement.
  </action>
  <verify>
    <automated>cd /Users/tald/Projects/claudeshell && npx vitest run tests/templates.test.ts tests/prompt.test.ts</automated>
  </verify>
  <done>5 templates defined, buildPromptFromTemplate works for all, existing prompt tests still pass, new template tests pass</done>
</task>

<task type="auto">
  <name>Task 2: Add theme builtin command with interactive selection and config persistence</name>
  <files>src/types.ts, src/classify.ts, src/builtins.ts, src/config.ts, src/shell.ts</files>
  <action>
**src/types.ts** — Add 'theme' to BuiltinName union:
```typescript
export type BuiltinName = 'cd' | 'exit' | 'quit' | 'clear' | 'export' | 'theme'
```

**src/classify.ts** — Add 'theme' to BUILTINS set:
```typescript
const BUILTINS: ReadonlySet<string> = new Set(['cd', 'exit', 'quit', 'clear', 'export', 'theme'])
```

**src/config.ts** — Add `prompt_template` field to `ClaudeShellConfig`:
```typescript
export interface ClaudeShellConfig {
  readonly api_key?: string
  readonly model?: string
  readonly history_size?: number
  readonly prompt_template?: string
}
```
Add type-narrowing for `prompt_template` in `loadConfig()` (same pattern as other fields):
```typescript
...(typeof obj.prompt_template === 'string' ? { prompt_template: obj.prompt_template } : {})
```
Add a `saveConfig(config: ClaudeShellConfig): void` function that writes to CONFIG_PATH (create dir if needed with `ensureConfigDir()`). Use `JSON.stringify(config, null, 2)`.

**src/builtins.ts** — Add `executeTheme` function:
```typescript
export async function executeTheme(rl: readline.Interface): Promise<string | undefined>
```
This function:
1. Imports `TEMPLATES`, `getTemplateByName`, `buildPromptFromTemplate` from templates.ts
2. Imports `abbreviatePath` and `getGitBranch` from prompt.ts
3. Prints a header: `\nAvailable themes:\n`
4. For each template in TEMPLATES, prints:
   - Number, label, description
   - A LIVE PREVIEW of the prompt using `buildPromptFromTemplate` with current cwd and homedir
   - If `requiresNerdFont`, append ` (requires Nerd Font)` to the description
   - Format: `  [N] Label — Description\n      Preview: {rendered prompt sample}\n`
5. Prompts user: `\nSelect theme (1-${TEMPLATES.length}): ` using rl.question (must accept the readline interface)
6. Validates input, returns the selected template name string, or undefined if cancelled/invalid
7. Does NOT save config itself — returns the name for shell.ts to handle

**src/shell.ts** — Wire theme command:
1. Load `prompt_template` from config at startup: `let currentTemplate = config.prompt_template ?? DEFAULT_TEMPLATE_NAME`
2. Pass `currentTemplate` to `buildPrompt` calls: `buildPrompt(process.cwd(), os.homedir(), currentTemplate)`
3. Handle `case 'theme'` in the builtin switch:
   - Call `const selected = await executeTheme(rl)` (pass readline interface)
   - If selected: update `currentTemplate = selected`, call `saveConfig({ ...config, prompt_template: selected })`, print confirmation
   - Prompt updates on next iteration automatically since `currentTemplate` changed
4. Import `DEFAULT_TEMPLATE_NAME` from templates.ts, `saveConfig` from config.ts, `executeTheme` from builtins.ts
  </action>
  <verify>
    <automated>cd /Users/tald/Projects/claudeshell && npx vitest run && npx tsc --noEmit</automated>
  </verify>
  <done>Typing 'theme' shows template list with live previews, selecting a number changes the prompt immediately, choice saved to ~/.claudeshell/config.json and restored on restart. All existing tests pass. TypeScript compiles clean.</done>
</task>

</tasks>

<verification>
1. `npx vitest run` — all tests pass (existing + new template tests)
2. `npx tsc --noEmit` — no type errors
3. `npm run build` — builds successfully
4. Manual smoke test: `npm run dev`, type `theme`, select each template, verify prompt changes
</verification>

<success_criteria>
- 5 prompt templates available (minimal, classic, powerline, hacker, pastel)
- Only powerline template requires Nerd Font; others use ASCII/common Unicode only
- `theme` command shows interactive selector with live previews
- Selected template persists in ~/.claudeshell/config.json
- All tests pass, TypeScript compiles clean, build succeeds
</success_criteria>

<output>
After completion, create `.planning/quick/260401-oup-add-interactive-prompt-template-selector/260401-oup-SUMMARY.md`
</output>
