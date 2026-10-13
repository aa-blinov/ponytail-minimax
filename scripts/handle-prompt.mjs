#!/usr/bin/env node
// UserPromptSubmit hook: implements `/ponytail lite|full|ultra|off|on`.
//
// Writes the chosen level to PLUGIN_DATA/config.json so it persists, and
// injects the change into the current turn so it also takes effect now.
//
// Only matches the explicit `/ponytail ...` command, so ordinary prose about
// a "normal mode" can never disable it by accident.
//
// Always fails open. Writes nothing to stdout when the prompt is not a command.

import { readFileSync } from 'node:fs';
import { clearLevel, setDisabled, writeLevel } from './settings.mjs';

const COMMAND = /^\s*\/ponytail(?:\s+(lite|full|ultra|off|on))?\s*$/i;

const EFFECT = {
  lite: 'Build what was asked. Name the smaller option in one line and let the user pick.',
  full: 'Take the smallest complete change: the ladder, every caller it touches, one check for non-trivial logic, and a reply naming what was skipped and any risk.',
  ultra: 'Also question the request: push back on any part the need does not justify, before writing code.',
  off: 'Ponytail is off for this session. Do not follow its rules.',
  on: 'Ponytail is back on for this session. Follow its rules.',
};

function readInput() {
  try {
    return JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    return {};
  }
}

function main() {
  const input = readInput();
  const match = COMMAND.exec(String(input?.prompt ?? ''));
  if (!match) return;

  const asked = (match[1] || 'full').toLowerCase();
  let persisted = false;

  if (asked === 'off') {
    persisted = setDisabled(true);
  } else {
    // "on" clears the stored level rather than pinning one, so the env var,
    // the upstream config file or "full" applies again.
    persisted = setDisabled(false);
    persisted = (asked === 'on' ? clearLevel() : writeLevel(asked)) || persisted;
  }

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
        additionalContext: `Ponytail switched to "${asked}". ${EFFECT[asked]}${
          persisted ? ' (saved for later sessions too)' : ''
        }`,
      },
    }),
  );
}

main();
