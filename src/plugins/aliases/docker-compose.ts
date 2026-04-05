import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "docker-compose",
  version: '1.0.0',
  description: "Docker Compose aliases (ported from oh-my-zsh)",
  aliases: {
    "dco": "docker compose",
    "dcb": "docker compose build",
    "dce": "docker compose exec",
    "dcps": "docker compose ps",
    "dcr": "docker compose run",
    "dcstop": "docker compose stop",
    "dcup": "docker compose up",
    "dcupb": "docker compose up --build",
    "dcupd": "docker compose up -d",
    "dcdn": "docker compose down",
    "dcl": "docker compose logs",
    "dclf": "docker compose logs -f",
    "dcpull": "docker compose pull",
    "dcrestart": "docker compose restart",
    "dcrm": "docker compose rm",
  },
}
