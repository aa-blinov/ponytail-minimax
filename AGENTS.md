# AGENTS.md — agent context for `ponytail-minimax`

A MiniMax Code plugin: six markdown skills copied from upstream Ponytail, a
manifest, and three Node.js scripts that inject the ruleset into a session and
switch its level. This file is what you need to work on the plugin without
reading all of it.

## Run / build / test

```bash
node --check scripts/inject-rules.mjs    # the only check that exists
node --check scripts/handle-prompt.mjs
node --check scripts/settings.mjs
```

There is no package manifest, no dependency, no build step and no test suite.
The three scripts are ES modules and use `node:fs`, `node:os` and `node:path`
and nothing else.

A hook runs from the terminal as well. It reads the event JSON on standard
input and writes the result on standard output:

```bash
echo '{"hook_event_name":"SessionStart"}' | PLUGIN_ROOT=$PWD node scripts/inject-rules.mjs
echo '{"prompt":"/ponytail lite"}' | PLUGIN_DATA=$(mktemp -d) node scripts/handle-prompt.mjs
```

Installing the plugin locally is a file copy:

```bash
rsync -a --exclude .git ponytail-minimax/ ~/.minimax/plugins/ponytail/
```

The runtime rescans the plugin directory on its own. The hooks apply to the
running session as soon as it rescans; the skills appear in a new session,
because the catalog is built when a session starts.

## Where things live

| Path | What it holds |
| --- | --- |
| `.minimax-plugin/plugin.json` | The manifest. The plugin name, the version, the six skill paths and the hook file, all listed by hand. |
| `hooks/hooks.json` | The three events, the script for each, and the five-second timeout on each. |
| `scripts/settings.mjs` | The shared parts: the list of levels, the order the settings are read in, the reader for the ruleset, and the writes into the data directory. |
| `scripts/inject-rules.mjs` | The `SessionStart` and `SubagentStart` hook. Builds the text and prints it as `hookSpecificOutput.additionalContext`. |
| `scripts/handle-prompt.mjs` | The `UserPromptSubmit` hook. Matches the `/ponytail` command and stores the level. |
| `skills/ponytail/SKILL.md` | The ruleset. Its body is what gets injected into the session. |
| `skills/ponytail-*/SKILL.md` | The other five skills. They run when they are named and are never injected. |
| `icon.png`, `icon-dark.png` | The plugin icons, 256 by 256 pixels. |

## Traps

- **The `disabled` file outranks every level.** `resolveSettings()` looks for
  `PLUGIN_DATA/disabled` before anything else, and returns off when the file is
  there. The level in `PLUGIN_DATA/config.json` is never read. `/ponytail off`
  writes that file and `/ponytail on` deletes it, so a level that looks stored
  in the JSON is not the state of the plugin.
- **`/ponytail on` deletes the stored level.** It calls `clearLevel()`, which
  removes `PLUGIN_DATA/config.json`, so the environment variable, the upstream
  config file or `full` applies again. `/ponytail on` is not `/ponytail full`.
- **The data directory path belongs to the runtime.** The README quotes
  `~/.minimax/v2/plugin-data/hooks/ponytail/`, and one runtime version lays it
  out that way. The scripts read `PLUGIN_DATA` from the environment and
  never build the path themselves. Do not hardcode it anywhere.
- **A missing `PLUGIN_ROOT` is a silent success.** `ruleset()` returns null
  when `PLUGIN_ROOT` is unset or the file cannot be read, and
  `inject-rules.mjs` then prints nothing and exits 0. The same holds for the
  writes: `writeLevel` and `setDisabled` return false, and the hook still
  prints its message without the "saved for later sessions too" tail. An unset
  environment variable looks exactly like a plugin with nothing to say.
- **The injected text comes from a single file.** `ruleset()` reads
  `skills/ponytail/SKILL.md`, strips the YAML frontmatter with a regex and
  trims what is left. The frontmatter carries the description and the argument
  hint that the runtime reads, so it must stay in the file and out of the
  injected text. `MAX_CONTEXT` is 65536 characters and the slice is silent: a
  longer ruleset is cut in the middle of a sentence. The file is 3027
  characters today.
- **The event name goes back out of the script.** `inject-rules.mjs` accepts
  `SessionStart` and `SubagentStart`; any other value is relabelled
  `SessionStart`, and the scope sentence, "this session" or "this delegated
  task", follows from that value. The JSON on standard output is what the
  runtime reads, so a change to the shape of `hookSpecificOutput` stops the
  injection without an error.
- **The prompt hook matches the bare command and nothing else.** The pattern is
  `^\s*\/ponytail(?:\s+(lite|full|ultra|off|on))?\s*$`, case-insensitive. A
  sentence that mentions ponytail never reaches it, and that is deliberate: a
  request to stop ponytail in prose must not switch the mode off. Loosening
  the pattern brings that back.
- **A hook has five seconds.** Every entry in `hooks/hooks.json` carries
  `"timeout": 5`. A script that waits on the network is killed, and the
  session waits the full five seconds for it.
- **The skills are namespaced by the plugin name.** MiniMax Code exposes them
  as `/ponytail:ponytail-review`. The slash forms printed inside the upstream
  `SKILL.md` files are Claude Code's and do not resolve here, and the upstream
  `ponytail-help` card points at Claude Code's plugin marketplace, which this
  runtime does not have.
- **Adding a skill means editing the manifest.** `plugin.json` lists the six
  skill paths by hand. A directory under `skills/` that is not in that array is
  not a skill.
- **Two of the six skills assume a different host.** `ponytail-debt` scans with
  `git grep --no-index` and honours the `.gitignore` files, so it expects git
  and a repository tree to walk. `ponytail-gain` prints an upstream benchmark
  measured on Claude Code with Opus 5.5, which says nothing about the
  repository it was invoked in. The other four work as they are.
- **The ruleset belongs to upstream.** The six `SKILL.md` files come from
  DietrichGebert/ponytail under MIT, and the `LICENSE` file names only that
  copyright, while `plugin.json` lists aa-blinov as the author. A change to a
  skill in this repository is a local patch to somebody else's prompt, and the
  divergence has to be visible.
- **The skills are a snapshot, and it is already behind.** All six files are
  byte-identical to upstream tag v5.2.0, commit 2961b52 of 2026-10-13.
  Upstream changed four of the six afterwards: the band feature landed on
  2026-10-16 and the `ponytail` argument hint gained `off`. Replacing the
  files with upstream's current ones is a decision about the Claude Code band,
  which does not exist in this runtime, and not a plain copy.

## Style / safety rails

- **Comments explain why, never what.** The three scripts say why they fail
  open and why the event name is echoed back. Keep that.
- **No emoji, in any file.** The house style bans them and the checker fails
  the build.
- **No dependencies.** The install is a file copy, so a dependency is a file
  that never arrives. `node:fs`, `node:os` and `node:path` are the whole list.
- **Every hook fails open.** No script may exit non-zero, wait on the network,
  or write to standard output when it has nothing to add.
- **The port stays a port.** The upstream skills are copied as they are, and
  new behaviour goes into the hooks or the manifest.
- **The upstream settings keep their meaning.** `PONYTAIL_DEFAULT_MODE` and
  `~/.config/ponytail/config.json` are read because upstream users already
  have them, and the resolution order between them is upstream's.

## Where the product truth lives

[`PRODUCT.md`](PRODUCT.md) holds it. Read it before changing what the plugin
does, and write the change there when the behaviour changes.
