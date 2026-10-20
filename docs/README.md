# Documentation

The index of the documents in this folder.

`ponytail-minimax` is a MiniMax Code plugin: six Markdown skills copied
from upstream Ponytail, a manifest, and three Node.js scripts that inject
the ruleset into a session and switch its level. The documents here say how
that is put together and what a change has to respect.

| Document | What it covers |
| --- | --- |
| [architecture.md](architecture.md) | The modules, the two data flows, the decisions behind them and the boundaries. |
| [screenshots/README.md](screenshots/README.md) | Why the repository carries no screenshots, and what the two icons are for. |
| [../README.md](../README.md) | The front door: what the plugin does, how to install it and how to configure it. |
| [../PRODUCT.md](../PRODUCT.md) | Who the plugin is for, and what it must not turn into. |
| [../AGENTS.md](../AGENTS.md) | The commands, the layout of the tree, and the traps of working on it. |
| [../DESIGN.md](../DESIGN.md) | The visual record: the icon pair, and the statement that the plugin draws nothing else. |

## Reading order

New here: [../README.md](../README.md), then [../PRODUCT.md](../PRODUCT.md)
for who the plugin is for and what it promises.

Changing the plugin: [architecture.md](architecture.md), then
[../AGENTS.md](../AGENTS.md) for the traps. The traps are the parts that a
reader cannot infer from the files, in particular the resolution order of
the level and the way the hooks fail open.

Refreshing the upstream skills: [../AGENTS.md](../AGENTS.md) records which
upstream release the six files came from and what changed afterwards.
