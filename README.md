# cc-dash-kit

## INSTALL PROMPT（中文；整段貼給 Claude Code CLI 或 Desktop Code）

> 請幫我安裝並試用 cc-dash-kit 看板。框架來源是 `<REPO_URL>`。如果它是本機目錄，直接用該目錄；如果是 Git repo 網址，先 clone 到目前工作目錄下的 `cc-dash-kit`。請在框架根目錄執行 `claude plugin validate .`，然後回到目前工作目錄，用 `claude plugin marketplace add --scope local <框架根目錄>` 和 `claude plugin install --scope local cc-dash-kit@cc-dash-kit-marketplace` 安裝。請重新載入 plugin；如需我手動輸入 `/reload-plugins`，請直接告訴我。先確認沒有 `dash.config.json` 時，零設定面板有 quota 和 session 兩張卡，必要時執行 `/cc-dash`；確認後才閱讀框架根目錄的 `ASSEMBLE.md`，依它的流程逐題問我三題、製作個人看板、再次 validate 和 test。寫好 config 後請我輸入 `/cc-dash` 立即重讀設定，並展示組裝後的面板。若任何步驟失敗，請修正並重試；不要讀取或搬移憑證。

## INSTALL PROMPT (English; paste the whole paragraph into Claude Code CLI or Desktop Code)

> Please install and try the cc-dash-kit dashboard. The framework source is `<REPO_URL>`. If it is a local directory, use it directly; if it is a Git repository URL, clone it into `cc-dash-kit` under the current working directory. In the framework root, run `claude plugin validate .`, then return to the current working directory and install with `claude plugin marketplace add --scope local <framework-root>` and `claude plugin install --scope local cc-dash-kit@cc-dash-kit-marketplace`. Reload the plugin; if I must type `/reload-plugins` myself, tell me directly. Before creating `dash.config.json`, confirm the zero-config pane shows quota and session cards, and run `/cc-dash` if needed. Then read `ASSEMBLE.md` in the framework root, ask me exactly three questions one at a time, build my personal dashboard, and validate and test it again. After writing config, ask me to run `/cc-dash` to reload it immediately, then show the assembled pane. If a step fails, fix it and retry. Do not read or move credentials.

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
