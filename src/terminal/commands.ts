import type { Profile } from '../data/profile'

// Saída do terminal é sempre texto tipado — nunca HTML. Entradas do
// usuário são tratadas como string pura; links só saem de `profile`.

export type LineKind = 'out' | 'muted' | 'accent' | 'error' | 'link' | 'title'

export interface Line {
  text: string
  kind?: LineKind
  href?: string
}

export type CommandAction =
  | { type: 'clear' }
  | { type: 'open'; url: string }
  | { type: 'goto'; section: string }

export interface CommandResult {
  lines: Line[]
  action?: CommandAction
}

export interface TerminalCommand {
  name: string
  description: string
  run: (profile: Profile) => CommandResult
}

const socialUrl = (profile: Profile, id: string): string =>
  profile.social.find((s) => s.id === id)?.url ?? profile.siteUrl

const openSocial = (
  profile: Profile,
  id: string,
  label: string,
): CommandResult => {
  const url = socialUrl(profile, id)
  return {
    lines: [{ text: `abrindo ${label} — ${url}`, kind: 'muted' }],
    action: { type: 'open', url },
  }
}

export const commands: TerminalCommand[] = [
  {
    name: 'help',
    description: 'lista os comandos disponíveis',
    run: () => ({
      lines: [
        { text: 'comandos disponíveis', kind: 'title' },
        ...commands.map((c) => ({
          text: `  ${c.name.padEnd(11)} ${c.description}`,
          kind: 'out' as LineKind,
        })),
        { text: 'dica: Tab completa, ↑ repete o último comando.', kind: 'muted' },
      ],
    }),
  },
  {
    name: 'whoami',
    description: 'quem está por trás deste site',
    run: (p) => ({
      lines: [
        { text: p.displayName, kind: 'title' },
        { text: `${p.role} · sócio na ${p.company.name}`, kind: 'out' },
        { text: p.location, kind: 'muted' },
      ],
    }),
  },
  {
    name: 'about',
    description: 'abre a seção sobre',
    run: (p) => ({
      lines: [{ text: p.headline, kind: 'out' }, { text: 'navegando até #sobre…', kind: 'muted' }],
      action: { type: 'goto', section: 'sobre' },
    }),
  },
  {
    name: 'projects',
    description: 'lista os projetos selecionados',
    run: (p) => ({
      lines: [
        { text: `${p.projects.length} projetos em ~/projects`, kind: 'title' },
        ...p.projects.map((proj) => ({
          text: `  ${proj.path.replace('~/projects/', '').padEnd(20)} ${proj.status}`,
          kind: 'out' as LineKind,
        })),
        { text: 'navegando até #projetos…', kind: 'muted' },
      ],
      action: { type: 'goto', section: 'projetos' },
    }),
  },
  {
    name: 'stack',
    description: 'tecnologias e ferramentas',
    run: (p) => ({
      lines: [
        ...p.stack.map((g) => ({
          text: `  ${g.title.padEnd(22)} ${g.items.join(', ')}`,
          kind: 'out' as LineKind,
        })),
        { text: 'navegando até #stack…', kind: 'muted' },
      ],
      action: { type: 'goto', section: 'stack' },
    }),
  },
  {
    name: 'links',
    description: 'central de links',
    run: (p) => ({
      lines: [
        ...p.social.map((s) => ({
          text: `  ${s.label.padEnd(12)} ${s.handle}`,
          kind: 'out' as LineKind,
        })),
        { text: 'navegando até #links…', kind: 'muted' },
      ],
      action: { type: 'goto', section: 'links' },
    }),
  },
  {
    name: 'contact',
    description: 'formas de contato',
    run: (p) => ({
      lines: [
        { text: `e-mail: ${p.email}`, kind: 'out' },
        { text: 'navegando até #contato…', kind: 'muted' },
      ],
      action: { type: 'goto', section: 'contato' },
    }),
  },
  {
    name: 'github',
    description: 'abre o GitHub em nova aba',
    run: (p) => openSocial(p, 'github', 'GitHub'),
  },
  {
    name: 'linkedin',
    description: 'abre o LinkedIn em nova aba',
    run: (p) => openSocial(p, 'linkedin', 'LinkedIn'),
  },
  {
    name: 'instagram',
    description: 'abre o Instagram em nova aba',
    run: (p) => openSocial(p, 'instagram', 'Instagram'),
  },
  {
    name: 'tsw',
    description: 'abre o site da TSW em nova aba',
    run: (p) => openSocial(p, 'tsw', p.company.name),
  },
  {
    name: 'clear',
    description: 'limpa o terminal',
    run: () => ({ lines: [], action: { type: 'clear' } }),
  },
]

const commandByName = new Map(commands.map((c) => [c.name, c]))

/** Comandos sugeridos como atalhos clicáveis sob o input. */
export const quickCommands = ['help', 'projects', 'stack', 'contact']

export function runCommand(rawInput: string, profile: Profile): CommandResult {
  const input = rawInput.trim().toLowerCase()
  if (input === '') return { lines: [] }

  const command = commandByName.get(input)
  if (command) return command.run(profile)

  const suggestion = commands.find((c) => c.name.startsWith(input[0] ?? ''))
  return {
    lines: [
      { text: `comando não encontrado: ${input}`, kind: 'error' },
      {
        text: suggestion
          ? `você quis dizer "${suggestion.name}"? digite "help" para ver todos.`
          : 'digite "help" para ver os comandos.',
        kind: 'muted',
      },
    ],
  }
}

/** Autocomplete simples: retorna candidatos que começam com o prefixo. */
export function completeCommand(prefix: string): string[] {
  const p = prefix.trim().toLowerCase()
  if (p === '') return []
  return commands.map((c) => c.name).filter((name) => name.startsWith(p))
}
