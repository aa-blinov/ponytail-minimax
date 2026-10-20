# ponytail-minimax

Lazy senior developer mode for MiniMax Code Desktop. The ruleset goes into the
agent's context when the session starts, so the agent aims at the smallest
change that fully solves the task from the first turn, and six skills cover the
review, the audit and the ledger of deferred work.

![Ponytail](icon.png)

[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Tag](https://img.shields.io/github/v/tag/aa-blinov/ponytail-minimax)](https://github.com/aa-blinov/ponytail-minimax/tags)

---

## Quick start

```bash
git clone --depth 1 https://github.com/aa-blinov/ponytail-minimax.git
mkdir -p ~/.minimax/plugins/ponytail
rsync -a --exclude .git ponytail-minimax/ ~/.minimax/plugins/ponytail/
```

MiniMax Code rescans local plugins on its own. The hooks apply to the session
that is already running as soon as the package is rescanned. The skill catalog
is built when a session starts, so open a new session to pick up the skills.
If the plugin does not appear at all, load the `plugin-creator` skill and ask
it to validate the package.

| Part | Needs |
| --- | --- |
| The three hooks | `node` on PATH |
| The six skills | nothing |

What gets copied is the package contents and not the clone, so that the `.git`
directory stays out of the plugin directory.

## What it does

- **Turns the mode on by itself.** The `SessionStart` and `SubagentStart` hooks
  inject the ruleset, so it is active in the root session and inside every
  delegated task, without the user naming a skill.
- **Switches the level in the session.** `/ponytail lite`, `/ponytail full`,
  `/ponytail ultra`, `/ponytail off` and `/ponytail on`. The choice is stored
  in the plugin's data directory and holds for later sessions.
- **Ships six skills.** A diff review, a repository audit, a ledger of the
  `shortcut:` comments, the upstream scoreboard, a reference card, and the
  ruleset itself.
- **Reads the upstream settings.** `PONYTAIL_DEFAULT_MODE` and
  `~/.config/ponytail/config.json` are honoured, so a setup written for
  upstream Ponytail keeps working.
- **Never holds up a session.** Each script catches its own errors, prints
  nothing when it has nothing to add, and exits 0.

### The skills

MiniMax Code namespaces plugin skills with the plugin name, so they are
invoked as `/ponytail:ponytail-review`. The slash forms printed inside the
upstream skill files are Claude Code's and do not resolve here.

| Invoke | What it does |
| --- | --- |
| `ponytail:ponytail` | The ruleset and the level ladder. |
| `ponytail:ponytail-review` | Reviews a change for bugs, risk, load, missing tests and code that should not exist. |
| `ponytail:ponytail-audit` | The same review for a whole repository, ranked, with at most 20 findings. |
| `ponytail:ponytail-debt` | Harvests `shortcut:` comments into a ledger. |
| `ponytail:ponytail-gain` | Prints the upstream benchmark scoreboard. |
| `ponytail:ponytail-help` | Reference card for the levels, the skills and the commands. |

## How it works

Upstream Ponytail injects its ruleset with Node.js lifecycle hooks written for
Claude Code and Codex. Those hooks do not run under MiniMax Code, so there the
skill only fires when it is named. This port keeps the same six skills and
adds the three MiniMax hook events, which is why the mode is on from the first
turn and stays on inside delegated tasks.

```
session start  ->  inject-rules.mjs  ->  ruleset as added context
prompt         ->  handle-prompt.mjs ->  level change, stored
```

`.minimax-plugin/plugin.json` is the manifest. It names the plugin, the version
1.2.1, the six skill files and the hook file.

`hooks/hooks.json` binds three events to three script calls. Each entry carries
a five-second timeout.

`scripts/settings.mjs` holds the shared parts: the list of levels, the order
the settings are read in, and the reader for the ruleset.

`scripts/inject-rules.mjs` puts the ruleset into the context of a session or of
a delegated task.

`scripts/handle-prompt.mjs` implements the `/ponytail` command.

The ruleset that goes into the context is the body of
[`skills/ponytail/SKILL.md`](skills/ponytail/SKILL.md) with its YAML
frontmatter removed. The other five skills are never injected; they run when
they are named. The injected text is capped at 65536 characters, and the file
is 3027 characters today.

The six skill files are upstream's, copied byte for byte. Upstream has moved on
since that snapshot, so a refresh is a decision rather than a merge.

## Configuration

The level comes from four places, and the first one that says something wins.
With none of them saying anything, the level is `full`.

| Order | Source | Key | Effect |
| --- | --- | --- | --- |
| 1 | `PLUGIN_DATA/disabled` | file | The file being there means off, whatever the level says. |
| 2 | `PLUGIN_DATA/config.json` | `level` | The level the switcher stored. |
| 3 | `PONYTAIL_DEFAULT_MODE` | environment variable | The level for a session with nothing stored. |
| 4 | `~/.config/ponytail/config.json` | `defaultMode` | The same, from a file. Windows: `%APPDATA%\ponytail\config.json`. |
| 5 | none | none | `full`. |

`off` is accepted at steps 2, 3 and 4, and disables the mode the same way the
flag file does.

`PLUGIN_DATA` is the data directory the runtime hands to the plugin. On the
machine this was written on, it is
`~/.minimax/v2/plugin-data/hooks/ponytail/`. That path is an internal layout
of the runtime and may move between runtime versions, so the flag can also be
set by hand:

```bash
touch ~/.minimax/v2/plugin-data/hooks/ponytail/disabled   # off
rm    ~/.minimax/v2/plugin-data/hooks/ponytail/disabled   # on
```

## Development

There is no package manifest, no dependency, no build step and no test suite.
The three scripts are Node.js ES modules and use nothing but `node:fs`,
`node:os` and `node:path`.

```bash
node --check scripts/inject-rules.mjs    # the only check that exists
node --check scripts/handle-prompt.mjs
node --check scripts/settings.mjs
```

A hook runs by hand from the terminal as well. It reads the event JSON on
standard input and writes the result on standard output.

```bash
echo '{"hook_event_name":"SessionStart"}' | PLUGIN_ROOT=$PWD node scripts/inject-rules.mjs
echo '{"prompt":"/ponytail lite"}' | PLUGIN_DATA=$(mktemp -d) node scripts/handle-prompt.mjs
```

| Path | What it holds |
| --- | --- |
| `.minimax-plugin/plugin.json` | The manifest: name, version, skill paths, hook file. |
| `hooks/hooks.json` | The three events and the scripts they call. |
| `scripts/settings.mjs` | Level resolution and the ruleset reader. |
| `scripts/inject-rules.mjs` | The `SessionStart` and `SubagentStart` hook. |
| `scripts/handle-prompt.mjs` | The `UserPromptSubmit` hook and the `/ponytail` command. |
| `skills/ponytail/SKILL.md` | The ruleset that gets injected. |
| `skills/ponytail-*/SKILL.md` | The five skills that run when they are named. |

The version lives in `.minimax-plugin/plugin.json` and nowhere else. A release
is that number and a git tag; `v1.2.1` points at the current commit.

## License

MIT. The `LICENSE` file carries the upstream copyright, Copyright (c) 2026
DietrichGebert, because the six `SKILL.md` files come from
[DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) under
MIT. The six files are byte-identical to the v5.2.0 release of upstream,
dated 2026-10-13. The hooks, the manifest and the icons were written for this
repository. See [LICENSE](LICENSE).
