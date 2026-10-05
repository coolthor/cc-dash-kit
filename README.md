# cc-dash-kit

> Install this Claude Code dashboard for me: https://github.com/coolthor/cc-dash-kit (follow INSTALL.md in the repo)

Your Claude Code status, beside the conversation. · [繁體中文](README.zh-TW.md)

![Claude Code conversation with the dashboard in a right-hand sidebar](docs/images/terminal-en.png)

## One-line install

Paste the sentence above into Claude Code. It follows [INSTALL.md](INSTALL.md), asks before changing your terminal layout, and offers to customize the dashboard after installation.

Just install, without customization:

```sh
claude plugin marketplace add coolthor/cc-dash-kit
claude plugin install --scope user cc-dash-kit@cc-dash-kit
```

User scope works across projects; use `--scope local` for a trial confined to one project. Reload plugins after installation. The terminal sidebar requires `/tui fullscreen`; see [INSTALL.md](INSTALL.md) for the layout step and Desktop Code behavior.

## Make it yours with one sentence

> Make this dashboard fit the things I check while working.

Claude follows [ASSEMBLE.md](ASSEMBLE.md), asks three questions, and writes a local `dash.config.json`. The default quota and session cards remain useful without setup.

| Before: ready without config | After: GPU and two local services |
| --- | --- |
| ![English default dashboard with quota and session cards](docs/images/before-en.png) | ![English customized dashboard with GPU and two local services](docs/images/after-en.png) |

## Cards

| Card | Needs | When unavailable |
| --- | --- | --- |
| Claude usage | Session usage data | Shows “Unavailable” until Claude supplies it |
| Session | Current session metadata | Shows available fields |
| GPU | `nvidia-smi` | Hidden |
| Disk | `df` and a configured path | Shows a read error |
| Endpoints | Configured HTTP URLs | Shows each endpoint as offline |
| Dispatch pause | Configured local flag path | Hidden until configured |

## Safety

The mod runs with Claude Code permissions. Review its code before installing. It reads session metadata and only the local resources you configure. Endpoint checks have short timeouts. The pause button changes only its configured local flag file; `pause_status` is advisory. Keep credentials out of config.

## Development

Run `claude plugin validate .` and `claude plugin test .`. See [dash.config.example.json](dash.config.example.json) for the config shape. Local `dash.config.json` is gitignored.

## License

[MIT](LICENSE) © coolthor.
