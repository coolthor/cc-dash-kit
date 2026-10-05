# Install cc-dash-kit

This guide is for Claude Code CLI and the local or SSH sessions in Claude Desktop's Code tab. Use the user's conversation language throughout: a Chinese installation request needs Traditional Chinese replies and customization questions, even if project instructions are in English.

1. Read this repository's marketplace manifest, plugin manifest, and this guide from `https://github.com/coolthor/cc-dash-kit`. Add the GitHub marketplace with `claude plugin marketplace add coolthor/cc-dash-kit`, then install with `claude plugin install --scope user cc-dash-kit@cc-dash-kit`. In a Claude Code session, `/plugin marketplace add coolthor/cc-dash-kit` followed by `/plugin install cc-dash-kit@cc-dash-kit` is equivalent. Use `--scope local` for a temporary project trial; user scope makes it available across projects. Do not install from a local checkout.
2. Reload plugins. If an interactive command is needed, ask the user to run `/reload-plugins`. Check the installed plugin appears and run `/cc-dash` if needed.
3. A terminal sidebar requires fullscreen rendering. Check whether the session is in fullscreen layout. If it is not, explain briefly: “The sidebar needs fullscreen layout.” Ask the user for consent before changing their saved setting. After consent, have the user run `/tui fullscreen`; Claude Code relaunches the conversation. Do not edit their settings directly. In Desktop Code, the pane opens alongside chat.
4. Before writing `dash.config.json`, show the zero configuration sidebar with the quota and session cards. Keep chat on the left and the dashboard on the right. Ask whether the user wants to customize it. If yes, read [ASSEMBLE.md](ASSEMBLE.md) and follow its three question flow. If no, stop after the working two card dashboard.

Never read or copy credentials. Do not send local machine details to the repository.
