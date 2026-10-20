# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

A plugin package for MiniMax Code Desktop. The runtime loads it from a
directory under `~/.minimax/plugins/`, reads
[`.minimax-plugin/plugin.json`](.minimax-plugin/plugin.json), and runs three
Node.js scripts as lifecycle hooks. There is no interface of its own: what the
user gets is text in the agent's session, and the scripts run under Node on
whichever platform the runtime runs on.

## Users

The person using MiniMax Code to write, fix or review code, and the agent
sitting next to them. The situation: the agent tends to build more than the
task needs, and the person wants the smallest change that fully solves it,
with a reply that names what was skipped and what risk is left.

The second audience is nobody yet. The repository was created on 2026-10-13,
and it has one star, no forks, no GitHub release and no listing anywhere else.
There is nowhere to count installs.

## Product Purpose

The plugin puts the upstream Ponytail ruleset into the agent's context at the
start of every session and every delegated task, so the mode is on before the
first instruction rather than after the user remembers to ask for it.

Success for the user: the agent proposes the smaller change and says so in
one line. Success for the product: the ruleset is in the context on turn one,
and it is still in the context inside a subagent.

## Positioning

Upstream Ponytail injects its ruleset with Node.js lifecycle hooks written for
Claude Code and Codex. Those hooks do not run under MiniMax Code, so there the
skill only fires when it is named. This port keeps the same six skills and
adds the three MiniMax hook events.

The second difference: the port reads the upstream settings,
`PONYTAIL_DEFAULT_MODE` and `~/.config/ponytail/config.json`, so somebody who
already configured Ponytail somewhere else gets the same level here.

The third: there is no marketplace entry and no installer. The plugin is a
directory of three scripts and six markdown files that gets copied into
`~/.minimax/plugins/ponytail/`.

## Operating Context

The user copies the directory into `~/.minimax/plugins/ponytail/` and restarts
nothing. MiniMax Code rescans local plugins on its own, and the hooks apply to
the session that is already running as soon as the rescan happens. The skill
catalog is built when a session starts, so a new session is needed for the
skills to appear.

The person using the plugin is in another window, in another application,
usually mid-task, while the agent works. The mode has to be on without them
asking, and it has to stop when they ask.

The three scripts run under Node.js. Each hook has a five-second timeout and
each one is allowed to fail open: a plugin that holds up a session costs more
than a plugin that says nothing.

## Capabilities and Constraints

Confirmed by the code:

- Three hook events: `SessionStart`, `SubagentStart` and `UserPromptSubmit`.
- The ruleset enters the session as `hookSpecificOutput.additionalContext`.
- Three levels, `lite`, `full` and `ultra`, with `full` as the default.
- The switcher accepts `/ponytail`, `/ponytail lite`, `/ponytail full`,
  `/ponytail ultra`, `/ponytail off` and `/ponytail on`.
- The chosen level is stored in `PLUGIN_DATA/config.json`, and `off` writes a
  `disabled` flag beside it.
- `PONYTAIL_DEFAULT_MODE` and `~/.config/ponytail/config.json` are read when
  nothing has been stored.
- The injected text is the body of
  [`skills/ponytail/SKILL.md`](skills/ponytail/SKILL.md) with the frontmatter
  removed, capped at 65536 characters.
- Six skills are exposed: ponytail, ponytail-review, ponytail-audit,
  ponytail-debt, ponytail-gain and ponytail-help.
- Every script catches its own errors and exits 0.
- The manifest names the six skill files and the hook file by path, and the
  version is 1.2.1.

Deliberately not true, and worth knowing before a change:

- The plugin builds nothing and ships no executable beyond the three scripts.
- `ponytail-debt` scans with `git grep --no-index`, so it expects git, and
  `ponytail-gain` prints a benchmark measured upstream on Claude Code with
  Opus 5.5.
- `ponytail-help` points at Claude Code's plugin marketplace, which this
  runtime does not have.
- There is no test suite.

Open questions, for the owner rather than for a guess:

- Whether the level belongs in the runtime's data directory at all, or in a
  path the plugin owns.
- Whether the three scripts should get a test suite. There is none today, and
  `node --check` is the only check that runs.
- Whether the two skills that assume another host, `ponytail-debt` and
  `ponytail-gain`, should be adapted for this runtime or dropped from the
  manifest.
- Whether the plugin should be published anywhere beyond a git clone. There is
  no listing today.

## Brand Commitments

**Name:** Ponytail. The plugin name is `ponytail` and the display name in the
manifest is `Ponytail`.

**Tone:** the upstream's. The persona is a senior developer who says nothing
and writes one line that works. The ruleset asks for short sentences and plain
words, and it ends every reply with what was skipped and what risk the user
must know.

**Assets:** `icon.png` and `icon-dark.png`, both 256 by 256 pixels, the light
one with dark bars and the dark one with light bars.

**Attribution:** the six `SKILL.md` files are upstream's, they carry upstream's
MIT copyright, and they are the v5.2.0 release of 2026-10-13 copied byte for
byte. Any change to them in this repository is a local patch and has to be
visible as one.

## Evidence on Hand

- [`.minimax-plugin/plugin.json`](.minimax-plugin/plugin.json) holds the name,
  the version 1.2.1, the six skill paths and the hook file.
- [`hooks/hooks.json`](hooks/hooks.json) holds the three events, the script
  for each and the five-second timeout.
- [`scripts/settings.mjs`](scripts/settings.mjs) holds the level list, the
  resolution order, the 65536-character cap and the data directory handling.
- `scripts/inject-rules.mjs` and `scripts/handle-prompt.mjs` hold the injected
  text and the switcher.
- The ruleset body is 3027 characters, and the six skill files are 424 lines
  in total.
- All six skill files are byte-identical to upstream tag v5.2.0, commit 2961b52
  of 2026-10-13. Upstream has changed four of the six since.
- The tag `v1.2.1` points at commit 81891df, "Bump to 1.2.1 for the corrected
  install instructions", dated 2026-10-13.
- The hook output was read from the scripts, and the switcher, the flag file
  and the two upstream settings were checked by running the scripts with
  crafted input.

Absent, and not to be invented: no install counts, no usage numbers, no
testimonials, no comparison with other agent plugins, and no GitHub release.
The repository has a git tag and one star.

## Product Principles

1. **The mode is on before the first turn.** The port exists because naming the
   skill and being in the mode are two different things. Every step that
   delays the ruleset past the first prompt has to earn its place.
2. **Every hook fails open.** A hook that holds up a session costs more than a
   hook that says nothing. The scripts catch their own errors, print nothing
   when they have nothing to add, and exit 0.
3. **The port stays a port.** The six skills are upstream's and the changes
   live in the hooks and the manifest. A divergence from upstream is a patch to
   somebody else's prompt, and it is written down as one.
4. **No dependencies and no build step.** The install is a file copy of three
   scripts and six markdown files. A dependency is a file that never arrives.
5. **Nothing is claimed that was not measured.** The scoreboard prints the
   upstream benchmark and refuses to invent a saving for the repository it was
   invoked in, because the version that was never written has no baseline to
   subtract from.

## Accessibility & Inclusion

- **The plugin has no interface of its own.** It adds text to the agent's
  context and a handful of commands, so the accessibility work falls on the
  code the agent writes. The ruleset itself puts accessibility on the list of
  the things that are never cut in the name of a smaller diff.
- **The configuration surface is text.** An environment variable, a JSON file
  and a slash command. Nothing depends on a colour, on a pointer position or
  on a path through a window.
- **The assets come in two themes.** `icon.png` for a light surface and
  `icon-dark.png` for a dark one, so the plugin stays legible on either.
- **No accessibility standard has been set for the plugin itself**, because
  there is no screen to set one for. Whether the English text of the six
  upstream skills, and the English-only command surface, are acceptable for a
  user who does not read English is an open question. The upstream skills are
  copied as they are, and this port does not translate them.
