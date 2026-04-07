import type { CompletionSpec } from '../../completions/types.js'
import type { PluginManifest } from '../types.js'

const awsSpec: CompletionSpec = {
  name: 'aws',
  subcommands: {
    s3: {
      name: 's3',
      subcommands: {
        ls: { name: 'ls' },
        cp: { name: 'cp', options: [{ name: '--recursive', description: 'Recursive' }] },
        mv: { name: 'mv', options: [{ name: '--recursive', description: 'Recursive' }] },
        rm: { name: 'rm', options: [{ name: '--recursive', description: 'Recursive' }] },
        sync: { name: 'sync', options: [{ name: '--delete', description: 'Delete extra files' }] },
        mb: { name: 'mb' },
        rb: { name: 'rb' },
      },
    },
    ec2: {
      name: 'ec2',
      subcommands: {
        'describe-instances': { name: 'describe-instances' },
        'run-instances': { name: 'run-instances' },
        'terminate-instances': { name: 'terminate-instances' },
        'start-instances': { name: 'start-instances' },
        'stop-instances': { name: 'stop-instances' },
      },
    },
    lambda: {
      name: 'lambda',
      subcommands: {
        invoke: { name: 'invoke' },
        'list-functions': { name: 'list-functions' },
        'create-function': { name: 'create-function' },
        'update-function-code': { name: 'update-function-code' },
      },
    },
    iam: {
      name: 'iam',
      subcommands: {
        'list-users': { name: 'list-users' },
        'create-user': { name: 'create-user' },
        'create-role': { name: 'create-role' },
        'list-roles': { name: 'list-roles' },
      },
    },
    cloudformation: {
      name: 'cloudformation',
      subcommands: {
        deploy: { name: 'deploy' },
        'create-stack': { name: 'create-stack' },
        'delete-stack': { name: 'delete-stack' },
        'describe-stacks': { name: 'describe-stacks' },
      },
    },
  },
  options: [
    { name: '--region', description: 'AWS region', args: [{ name: 'region' }] },
    { name: '--profile', description: 'AWS profile', args: [{ name: 'profile' }] },
    { name: '--output', description: 'Output format', args: [{ name: 'format' }] },
  ],
}

const gcloudSpec: CompletionSpec = {
  name: 'gcloud',
  subcommands: {
    compute: {
      name: 'compute',
      subcommands: {
        instances: {
          name: 'instances',
          subcommands: {
            list: { name: 'list' },
            create: { name: 'create' },
            delete: { name: 'delete' },
            start: { name: 'start' },
            stop: { name: 'stop' },
            describe: { name: 'describe' },
          },
        },
        disks: {
          name: 'disks',
          subcommands: {
            list: { name: 'list' },
            create: { name: 'create' },
            delete: { name: 'delete' },
          },
        },
        'firewall-rules': {
          name: 'firewall-rules',
          subcommands: {
            list: { name: 'list' },
            create: { name: 'create' },
            delete: { name: 'delete' },
          },
        },
      },
    },
    container: {
      name: 'container',
      subcommands: {
        clusters: {
          name: 'clusters',
          subcommands: {
            list: { name: 'list' },
            create: { name: 'create' },
            delete: { name: 'delete' },
            'get-credentials': { name: 'get-credentials' },
          },
        },
        'node-pools': {
          name: 'node-pools',
          subcommands: {
            list: { name: 'list' },
            create: { name: 'create' },
            delete: { name: 'delete' },
          },
        },
      },
    },
    functions: {
      name: 'functions',
      subcommands: {
        deploy: { name: 'deploy' },
        list: { name: 'list' },
        delete: { name: 'delete' },
        logs: { name: 'logs' },
      },
    },
    iam: {
      name: 'iam',
      subcommands: {
        'service-accounts': {
          name: 'service-accounts',
          subcommands: {
            list: { name: 'list' },
            create: { name: 'create' },
            delete: { name: 'delete' },
          },
        },
      },
    },
    projects: {
      name: 'projects',
      subcommands: {
        list: { name: 'list' },
        describe: { name: 'describe' },
        create: { name: 'create' },
      },
    },
  },
  options: [
    { name: '--project', description: 'Project ID', args: [{ name: 'project' }] },
    { name: '--format', description: 'Output format', args: [{ name: 'format' }] },
    { name: '--quiet', description: 'Suppress prompts' },
  ],
}

const azSpec: CompletionSpec = {
  name: 'az',
  subcommands: {
    vm: {
      name: 'vm',
      subcommands: {
        create: { name: 'create' },
        list: { name: 'list' },
        delete: { name: 'delete' },
        start: { name: 'start' },
        stop: { name: 'stop' },
        show: { name: 'show' },
      },
    },
    storage: {
      name: 'storage',
      subcommands: {
        account: {
          name: 'account',
          subcommands: {
            list: { name: 'list' },
            create: { name: 'create' },
            delete: { name: 'delete' },
          },
        },
        container: {
          name: 'container',
          subcommands: {
            list: { name: 'list' },
            create: { name: 'create' },
            delete: { name: 'delete' },
          },
        },
        blob: {
          name: 'blob',
          subcommands: {
            upload: { name: 'upload' },
            download: { name: 'download' },
            list: { name: 'list' },
            delete: { name: 'delete' },
          },
        },
      },
    },
    webapp: {
      name: 'webapp',
      subcommands: {
        create: { name: 'create' },
        list: { name: 'list' },
        delete: { name: 'delete' },
        deploy: { name: 'deploy' },
      },
    },
    group: {
      name: 'group',
      subcommands: {
        create: { name: 'create' },
        list: { name: 'list' },
        delete: { name: 'delete' },
        show: { name: 'show' },
      },
    },
    login: { name: 'login' },
  },
  options: [
    { name: '--subscription', description: 'Subscription', args: [{ name: 'sub' }] },
    { name: ['-o', '--output'], description: 'Output format', args: [{ name: 'format' }] },
  ],
}

export const plugin: PluginManifest = {
  name: 'cloud-completions',
  version: '1.0.0',
  description: 'AWS/GCloud/Azure CLI Tab completions',
  completionSpecs: [awsSpec, gcloudSpec, azSpec],
}
