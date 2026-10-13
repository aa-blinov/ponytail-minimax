#!/usr/bin/env node
// SessionStart hook: injects the ponytail ruleset into the opening turn.
//
// Kill switch: create an empty file named `disabled` under PLUGIN_DATA.
// Level switch: write {"level":"lite"|"full"|"ultra"} to config.json there.
//
// Always fails open. A side-effect-only run prints nothing and exits 0.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const MAX_CONTEXT = 65536;

function readStdin() {
  // The runtime always sends one JSON object; draining it is polite but not required.
  try {
    return readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function stripFrontmatter(text) {
  const match = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/.exec(text);
  return match ? text.slice(match[0].length) : text;
}

function main() {
  readStdin();

  const pluginRoot = process.env.PLUGIN_ROOT || process.env.MINIMAX_PLUGIN_ROOT;
  const pluginData = process.env.PLUGIN_DATA;

  // Bail out silently if disabled or misconfigured.
  if (!pluginRoot) return;
  if (pluginData && existsSync(join(pluginData, 'disabled'))) return;

  let body;
  try {
    body = stripFrontmatter(
      readFileSync(join(pluginRoot, 'skills', 'ponytail', 'SKILL.md'), 'utf8'),
    ).trim();
  } catch {
    return; // Missing ruleset is not a user-facing error.
  }
  if (!body) return;

  let level = 'full';
  if (pluginData && existsSync(join(pluginData, 'config.json'))) {
    try {
      const config = JSON.parse(readFileSync(join(pluginData, 'config.json'), 'utf8'));
      if (['lite', 'full', 'ultra'].includes(config?.level)) level = config.level;
    } catch {
      // A broken config falls back to the default level.
    }
  }

  const context = `Ponytail is active at level "${level}" for this session. Stay active until the user says "stop ponytail" or "normal mode".\n\n${body}`.slice(
    0,
    MAX_CONTEXT,
  );

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: context,
      },
    }),
  );
}

main();
