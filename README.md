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

Switch level — takes effect immediately and persists for later sessions:

```
/ponytail lite      build what was asked, name the smaller option
/ponytail           back to full (the default)
/ponytail ultra     also question the request before building
/ponytail off       stop following the rules
/ponytail on        start again
```

The level is written to the plugin's data directory, so a new session keeps it.
`off` writes a `disabled` flag, which is also the kill switch to use by hand:

```bash
touch ~/.minimax/v2/plugin-data/hooks/ponytail/disabled   # off
rm    ~/.minimax/v2/plugin-data/hooks/ponytail/disabled   # on
```

That directory is the runtime's own `PLUGIN_DATA` for this plugin — an internal
layout that may move between runtime versions. Two upstream settings are also
honoured, both lower priority than the switcher:

```bash
export PONYTAIL_DEFAULT_MODE=ultra            # env var, highest upstream priority
echo '{"defaultMode":"lite"}' > ~/.config/ponytail/config.json
```

Resolution order: the `/ponytail` command > `PONYTAIL_DEFAULT_MODE` >
`~/.config/ponytail/config.json` > `full`. Any of them may be `"off"`.

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

`ponytail:ponytail-help` is upstream's own card, kept verbatim, and its config
section now describes this port correctly — the env var and the config file it
documents are both read. Its update section still points at Claude Code's
marketplace, which does not exist here: pull from this repository instead.

`ponytail:ponytail-debt` and `ponytail:ponytail-gain` carry further upstream
assumptions: debt expects a git repository, gain prints a Claude Code / Opus 5.5
benchmark. Everything else works as written.

## License

MIT. The six `SKILL.md` files are from
[DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail), MIT,
Copyright (c) 2026 DietrichGebert — see `LICENSE`. The hook, manifest and icons
are new in this repository.