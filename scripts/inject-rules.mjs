#!/usr/bin/env node
// Rule-injection hook for SessionStart and SubagentStart.
//
// Echoes back hook_event_name so the same script serves both events. Both
// accept hookSpecificOutput.additionalContext, so one script covers both.
//
// Kill switch: create an empty file named `disabled` under PLUGIN_DATA.
// Level switch: write {"level":"lite"|"full"|"ultra"} to config.json there.
//
// Always fails open. A side-effect-only run prints nothing and exits 0.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const MAX_CONTEXT = 65536;
const SUPPORTED = new Set(['SessionStart', 'SubagentStart']);

function readStdin() {
  try {
    return JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    return {};
  }
}

function stripFrontmatter(text) {
  const match = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/.exec(text);
  return match ? text.slice(match[0].length) : text;
}

function main() {
  const input = readStdin();

  // Echo the active event so one script is valid for every event it serves.
  const event = SUPPORTED.has(input?.hook_event_name)
    ? input.hook_event_name
    : 'SessionStart';

  const pluginRoot = process.env.PLUGIN_ROOT || process.env.MINIMAX_PLUGIN_ROOT;
  const pluginData = process.env.PLUGIN_DATA;

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

  const scope = event === 'SubagentStart' ? 'this delegated task' : 'this session';
  const context = `Ponytail is active at level "${level}" for ${scope}. Stay active until the user says "stop ponytail" or "normal mode".\n\n${body}`.slice(
    0,
    MAX_CONTEXT,
  );

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: event,
        additionalContext: context,
      },
    }),
  );
}

main();
