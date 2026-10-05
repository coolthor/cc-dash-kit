# cc-dash-kit

A small Claude Code mod framework for a personal dashboard.

```sh
git clone <this-repo-url> cc-dash-kit && claude --plugin-dir "$PWD/cc-dash-kit"
```

With no `dash.config.json`, the pane shows exactly two cards: Claude subscription usage for the 5 hour and weekly windows, and the current session. If Claude Code has not supplied rate limit data yet, the quota card says “未提供”. Use `/cc-dash` to open the pane manually when it cannot auto place in a narrow terminal.

To customize it, open this repo in Claude Code and say:

> 根據這個 repo 的框架和我的使用習慣，幫我製作看板

Claude should follow [ASSEMBLE.md](ASSEMBLE.md): detect local capabilities, ask three questions, select sources, write `dash.config.json`, then validate and test. `dash.config.example.json` shows the format. A sample with placeholder hosts is in `examples/`.

## Safety and scope

Claude Code mods run with the same permissions as Claude Code and have no sandbox. Review the code before loading. This framework reads `dash.config.json`, Claude Code's usage and session metadata, and only the local resources selected in configuration. The optional probes use `nvidia-smi`, `df`, or `curl`; the optional pause button writes or deletes its configured local flag file. No conversation history or transcript is read. No token or credential belongs in config. `pause_status` is a read only advisory tool; it does not enforce permissions over other AI systems.

For development, run `claude plugin validate .` and `claude plugin test .`. `dash.config.json` is gitignored so a local endpoint list is not committed accidentally.
