#!/usr/bin/env node
// Rule-injection hook for SessionStart and SubagentStart.
//
// Echoes back hook_event_name so the same script serves both events. Both
// accept hookSpecificOutput.additionalContext, so one script covers both.
//
// Always fails open. A side-effect-only run prints nothing and exits 0.

import { readFileSync } from 'node:fs';
import { MAX_CONTEXT, resolveSettings, ruleset } from './settings.mjs';

const SUPPORTED = new Set(['SessionStart', 'SubagentStart']);

function readInput() {
  try {
    return JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    return {};
  }
}

function main() {
  const input = readInput();
  const event = SUPPORTED.has(input?.hook_event_name)
    ? input.hook_event_name
    : 'SessionStart';

  const { level, disabled } = resolveSettings();
  if (disabled) return;

  const body = ruleset();
  if (!body) return;

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
