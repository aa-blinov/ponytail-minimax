# ponytail-minimax

[Ponytail](https://github.com/DietrichGebert/ponytail) for MiniMax Code Desktop.

Lazy senior developer mode. The best code is the code never written.

## Why this repo

Upstream Ponytail injects its ruleset with Node.js lifecycle hooks written for
Claude Code and Codex. Those hooks do not run under MiniMax Code, so there the
skill only fires when you name it.

This is the same six skills plus one MiniMax `SessionStart` hook, so the mode is
actually **on** from the first turn.

## Install

```bash
git clone https://github.com/aa-blinov/ponytail-minimax.git
cp -R ponytail-minimax ~/.minimax/plugins/ponytail
```

MiniMax Code rescans local plugins automatically. No restart needed. If it does
not show up, load the `plugin-creator` skill and ask it to validate the package.

The plugin needs `node` on PATH for the hook to run. Skills work without it.

## Use

Ponytail is active for the whole session. Switch level:

```bash
# lite | full (default) | ultra
echo '{"level":"ultra"}' > ~/.minimax/v2/plugin-data/hooks/ponytail/config.json
```

Turn it off without uninstalling:

```bash
touch ~/.minimax/v2/plugin-data/hooks/ponytail/disabled
```

Or just say "stop ponytail" / "normal mode" in the conversation.

## Skills

| Skill | What it does |
|---|---|
| `ponytail` | Lazy senior dev mode and the core ladder |
| `ponytail-review` | Review a diff for over-engineering |
| `ponytail-audit` | Whole-repo bloat audit, ranked |
| `ponytail-debt` | Harvest `shortcut:` comments into a ledger |
| `ponytail-gain` | Measured-impact scoreboard |
| `ponytail-help` | Quick reference |

`ponytail-debt` and `ponytail-gain` carry upstream assumptions that do not hold
here: debt expects a git repo, gain prints a Claude Code / Opus 5.5 benchmark.
Everything else works as written.

## License

MIT. The six `SKILL.md` files are from
[DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail), MIT,
Copyright (c) 2026 DietrichGebert — see `LICENSE`. The hook, manifest and icons
are new in this repository.