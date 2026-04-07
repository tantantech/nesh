import type { CompletionSpec } from '../../completions/types.js'
import type { PluginManifest } from '../types.js'

const RESOURCE_TYPES = [
  'pods', 'deployments', 'services', 'configmaps', 'secrets',
  'namespaces', 'nodes', 'ingress', 'pv', 'pvc',
  'jobs', 'cronjobs', 'statefulsets', 'daemonsets', 'replicasets',
] as const

const resourceTypeArg = {
  name: 'resource',
  generators: [async () => [...RESOURCE_TYPES]],
} as const

const commonOptions = [
  { name: ['-n', '--namespace'], description: 'Namespace', args: [{ name: 'namespace' }] },
  { name: ['-o', '--output'], description: 'Output format', args: [{ name: 'format' }] },
  { name: '-l', description: 'Label selector', args: [{ name: 'selector' }] },
  { name: '--all-namespaces', description: 'All namespaces' },
] as const

const kubectlSpec: CompletionSpec = {
  name: 'kubectl',
  subcommands: {
    get: {
      name: 'get',
      args: [resourceTypeArg],
      options: [...commonOptions],
    },
    describe: {
      name: 'describe',
      args: [resourceTypeArg],
      options: [...commonOptions],
    },
    apply: {
      name: 'apply',
      options: [
        { name: '-f', description: 'Filename', args: [{ name: 'file', template: 'filepaths' }] },
        { name: '-k', description: 'Kustomization dir', args: [{ name: 'dir', template: 'folders' }] },
        ...commonOptions,
      ],
    },
    delete: {
      name: 'delete',
      args: [resourceTypeArg],
      options: [
        { name: '-f', description: 'Filename', args: [{ name: 'file', template: 'filepaths' }] },
        { name: '--force', description: 'Force delete' },
        ...commonOptions,
      ],
    },
    logs: {
      name: 'logs',
      args: [{ name: 'pod' }],
      options: [
        { name: '-f', description: 'Follow logs' },
        { name: '-c', description: 'Container', args: [{ name: 'container' }] },
        { name: '--tail', description: 'Lines', args: [{ name: 'lines' }] },
        { name: '--previous', description: 'Previous instance' },
        ...commonOptions,
      ],
    },
    exec: {
      name: 'exec',
      args: [{ name: 'pod' }],
      options: [
        { name: '-it', description: 'Interactive TTY' },
        { name: '-c', description: 'Container', args: [{ name: 'container' }] },
        ...commonOptions,
      ],
    },
    'port-forward': {
      name: 'port-forward',
      args: [{ name: 'pod' }],
      options: [...commonOptions],
    },
    create: {
      name: 'create',
      options: [
        { name: '-f', description: 'Filename', args: [{ name: 'file', template: 'filepaths' }] },
        ...commonOptions,
      ],
    },
    edit: {
      name: 'edit',
      args: [resourceTypeArg],
      options: [...commonOptions],
    },
    scale: {
      name: 'scale',
      args: [resourceTypeArg],
      options: [
        { name: '--replicas', description: 'Replica count', args: [{ name: 'count' }] },
        ...commonOptions,
      ],
    },
    rollout: {
      name: 'rollout',
      subcommands: {
        status: { name: 'status', args: [resourceTypeArg] },
        history: { name: 'history', args: [resourceTypeArg] },
        undo: { name: 'undo', args: [resourceTypeArg] },
        restart: { name: 'restart', args: [resourceTypeArg] },
      },
    },
  },
}

export const plugin: PluginManifest = {
  name: 'kubectl-completions',
  version: '1.0.0',
  description: 'Kubernetes kubectl Tab completions',
  completionSpecs: [kubectlSpec],
}
