# Architecture

How ponytail-minimax is put together.

The plugin is a directory of files that a runtime reads. The runtime loads a
manifest, runs three Node.js scripts at three points in a session, and makes
six Markdown files available as skills. Nothing is compiled, nothing is
installed with a package manager, and nothing is drawn.

## The shape

There are ten files that matter and two pictures. The scripts are ES modules
and use `node:fs`, `node:os` and `node:path`, so the whole plugin runs on a
bare Node install.

| Path | What it is responsible for |
| --- | --- |
| `.minimax-plugin/plugin.json` | The manifest. The plugin name, the version 1.2.1, the category, the two icon paths and the six skill paths, all written out by hand. |
| `hooks/hooks.json` | The three runtime events, the script each one calls, and the five-second timeout on each. |
| `scripts/settings.mjs` | The shared parts: the list of levels, the order the settings are read in, the reader for the ruleset, and the writes into the data directory. |
| `scripts/inject-rules.mjs` | The `SessionStart` and `SubagentStart` hook. It builds the ruleset text and prints it as `hookSpecificOutput.additionalContext`. |
| `scripts/handle-prompt.mjs` | The `UserPromptSubmit` hook. It matches the `/ponytail` command and stores the level. |
| `skills/ponytail/SKILL.md` | The ruleset. Its body, without the frontmatter, is the text that gets injected. |
| `skills/ponytail-review/SKILL.md` | The diff review skill. It runs when it is named. |
| `skills/ponytail-audit/SKILL.md` | The repository audit skill. It runs when it is named. |
| `skills/ponytail-debt/SKILL.md` | The ledger of `shortcut:` comments. It runs when it is named. |
| `skills/ponytail-gain/SKILL.md` | The upstream scoreboard. It runs when it is named. |
| `skills/ponytail-help/SKILL.md` | The reference card. It runs when it is named. |
| `icon.png`, `icon-dark.png` | The two plugin icons, 256 by 256 pixels. |

The version lives in `.minimax-plugin/plugin.json` and nowhere else. A
release is that number and a git tag.

## The data flow

Injecting the ruleset:

```
session start (or delegated task start)
  -> inject-rules.mjs
  -> settings.mjs reads PLUGIN_DATA, PLUGIN_ROOT
  -> skills/ponytail/SKILL.md, frontmatter stripped, trimmed
  -> capped at 65536 characters
  -> hookSpecificOutput.additionalContext on standard output
```

Switching the level:

```
prompt -> handle-prompt.mjs -> matches /ponytail <level>
  -> PLUGIN_DATA/config.json  (or PLUGIN_DATA/disabled, for off)
  -> the next session resolves the level again
```

The two flows share `settings.mjs` and nothing else. The injector reads, the
switcher writes, and the level is resolved on every session start rather
than kept in memory.

Resolution order, first match wins:

```
PLUGIN_DATA/disabled        the file being there means off
PLUGIN_DATA/config.json     the level the switcher stored
PONYTAIL_DEFAULT_MODE       the environment variable
~/.config/ponytail/config.json   the upstream file
full                        the default
```

## Decisions worth knowing about

### The mode is injected, not named

Upstream Ponytail injects its ruleset with lifecycle hooks written for
Claude Code and Codex. Those hooks do not run under MiniMax Code, so there
the ruleset only arrives when the user names the skill, which is a second
turn the person has to spend. This port binds the same ruleset to the
`SessionStart` and `SubagentStart` events, so the mode is on before the
first instruction and inside every delegated task.

The cost is that the ruleset costs context in every session, whether or not
the task needs it. That is the trade the port exists to make.

### The flag file outranks the level

`resolveSettings()` looks for `PLUGIN_DATA/disabled` before it reads
anything else, and returns off when the file is there. The level stored in
`config.json` is never read in that case, so a stored level can look active
while the plugin is off. The switcher keeps the two in step by writing and
deleting that file, but the file is the state.

### Every hook fails open

Each script wraps its own work in a try and catch, prints nothing when it
has nothing to add, and exits 0. A hook that throws, that waits on the
network or that exits non-zero costs the user a session, and a plugin that
says nothing costs nothing.

The cost of this choice is that a broken installation is silent. A missing
`PLUGIN_ROOT` and an unreadable ruleset file look exactly like a plugin
with nothing to say.

### The injected text comes from one file and one cap

The ruleset is the body of `skills/ponytail/SKILL.md` with the YAML
frontmatter removed by a regular expression. The frontmatter carries the
description and the argument hint that the runtime reads, so it has to stay
in the file and out of the injected text. The result is capped at 65536
characters and the slice is silent, so a longer ruleset would be cut in the
middle of a sentence. The file is 3027 characters today.

### The event name goes back out of the script

`inject-rules.mjs` accepts `SessionStart` and `SubagentStart`, and relabels
any other value to `SessionStart`. The sentence that follows, about this
session or about this delegated task, is built from that value. The JSON on
standard output is what the runtime reads, so a change to the shape of
`hookSpecificOutput` stops the injection without an error anywhere.

### The prompt hook matches the bare command and nothing else

The pattern is `^\s*\/ponytail(?:\s+(lite|full|ultra|off|on))?\s*$`, and it
is case-insensitive. A sentence that mentions ponytail never reaches it,
and that is deliberate: a request to stop the mode, written in prose, must
not switch it off.

### The upstream settings keep their meaning

`PONYTAIL_DEFAULT_MODE` and `~/.config/ponytail/config.json` are read
because somebody who already configured Ponytail somewhere else expects the
same level here. They sit below the plugin's own stored level and above the
default, and `off` is accepted in all three places.

### The skills are listed by hand

`plugin.json` names the six skill paths in an array. A directory under
`skills/` that is not in that array is not a skill, and nothing scans the
directory to find out. The cost is one more edit when a skill is added.

## Boundaries

- **`skills/` is upstream's.** The six files are copied byte for byte from
  the v5.2.0 release of DietrichGebert/ponytail. A change to them in this
  repository is a local patch to somebody else's prompt, and the
  divergence has to be visible.
- **`scripts/` uses nothing but the Node standard library.** The install is
  a file copy, so a dependency is a file that never arrives.
- **A script may not write to standard output when it has nothing to add.**
  The runtime treats output as context, and noise costs the user tokens.
- **A script may not exit non-zero.** Every hook fails open.
- **A hook may not wait on the network.** Each entry in `hooks/hooks.json`
  carries a five-second timeout, and the session waits the full five seconds
  for a script that hangs.
- **The data directory path belongs to the runtime.** The scripts read
  `PLUGIN_DATA` from the environment and never build the path themselves,
  because the layout under `~/.minimax/v2/` is the runtime's business and
  may move between versions.
