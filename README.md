# ponytail-minimax

[Ponytail](https://github.com/DietrichGebert/ponytail) for MiniMax Code Desktop.

Lazy senior developer mode. The best code is the code never written.

## Why this repo

Upstream Ponytail injects its ruleset with Node.js lifecycle hooks written for
Claude Code and Codex. Those hooks do not run under MiniMax Code, so there the
skill only fires when you name it.

This is the same six skills plus two MiniMax hooks, `SessionStart` and
`SubagentStart`, so the mode is actually **on** from the first turn — and stays on
inside delegated tasks too.

## Install

```bash
git clone https://github.com/aa-blinov/ponytail-minimax.git
cp -R ponytail-minimax ~/.minimax/plugins/ponytail
```

MiniMax Code rescans local plugins automatically, and the hooks apply to the
current session as soon as the package is rescanned. The skill catalog, however,
is built when a session starts — open a new session to pick up the skills. If the
plugin does not appear at all, load the `plugin-creator` skill and ask it to
validate the package.

The plugin needs `node` on PATH for the hooks to run. Skills work without it.

## Use

Ponytail is active for the whole session, root agent and delegated agents alike.
Switch level — it takes effect on the next session or delegated task:

```bash
# lite | full (default) | ultra
echo '{"level":"ultra"}' > ~/.minimax/v2/plugin-data/hooks/ponytail/config.json
```

Turn it off without uninstalling:

```bash
touch ~/.minimax/v2/plugin-data/hooks/ponytail/disabled
```

Or just say "stop ponytail" / "normal mode" in the conversation.

That path is the runtime's own `PLUGIN_DATA` directory for this plugin. It is an
internal layout and may move between runtime versions.

## Skills

MiniMax Code namespaces plugin skills with the plugin name, so invoke them as
`/ponytail:ponytail-review`, not `/ponytail-review`. The slash forms printed
inside the upstream skill files are Claude Code's and do not work here.

| Invoke | What it does |
|---|---|
| `ponytail:ponytail` | Lazy senior dev mode and the core ladder |
| `ponytail:ponytail-review` | Review a diff for over-engineering |
| `ponytail:ponytail-audit` | Whole-repo bloat audit, ranked |
| `ponytail:ponytail-debt` | Harvest `shortcut:` comments into a ledger |
| `ponytail:ponytail-gain` | Measured-impact scoreboard |
| `ponytail:ponytail-help` | Quick reference |

`ponytail:ponytail-help` is upstream's own card, kept verbatim, and two of its
sections do not apply to this port: it documents the `PONYTAIL_DEFAULT_MODE`
environment variable and `~/.config/ponytail/config.json`, neither of which this
hook reads. Use the `PLUGIN_DATA/config.json` path above. It also tells you to
update through Claude Code's marketplace, which does not exist here — pull from
this repository instead.

`ponytail:ponytail-debt` and `ponytail:ponytail-gain` carry further upstream
assumptions: debt expects a git repository, gain prints a Claude Code / Opus 5.5
benchmark. Everything else works as written.

## License

MIT. The six `SKILL.md` files are from
[DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail), MIT,
Copyright (c) 2026 DietrichGebert — see `LICENSE`. The hook, manifest and icons
are new in this repository.