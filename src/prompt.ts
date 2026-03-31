import pc from 'picocolors'

export function abbreviatePath(cwd: string, homedir: string): string {
  if (cwd === homedir) return '~'
  if (cwd.startsWith(homedir + '/')) return '~' + cwd.slice(homedir.length)
  return cwd
}

export function buildPrompt(cwd: string, homedir: string): string {
  const display = abbreviatePath(cwd, homedir)
  return `${pc.dim('claudeshell')} ${pc.cyan(display)} ${pc.reset('>')} `
}
