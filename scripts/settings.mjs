// Shared settings resolution for the ponytail hooks.
//
// Level resolution order, first match wins:
//   1. PLUGIN_DATA/config.json      — written by our own /ponytail switcher
//   2. PONYTAIL_DEFAULT_MODE        — env var, per upstream ponytail-help
//   3. ~/.config/ponytail/config.json — per upstream ponytail-help
//   4. full
//
// "off" anywhere in 1-3 means disabled, same as the PLUGIN_DATA/disabled file.

import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const LEVELS = ['lite', 'full', 'ultra'];
export const MAX_CONTEXT = 65536;

export function pluginData() {
  return process.env.PLUGIN_DATA || null;
}

export function pluginRoot() {
  return process.env.PLUGIN_ROOT || process.env.MINIMAX_PLUGIN_ROOT || null;
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

// Returns { level, disabled }.
export function resolveSettings() {
  const data = pluginData();

  if (data && existsSync(join(data, 'disabled'))) {
    return { level: null, disabled: true };
  }

  const own = data && readJson(join(data, 'config.json'));
  const ownLevel = own?.level;
  if (ownLevel === 'off') return { level: null, disabled: true };
  if (LEVELS.includes(ownLevel)) return { level: ownLevel, disabled: false };

  const envLevel = process.env.PONYTAIL_DEFAULT_MODE;
  if (envLevel === 'off') return { level: null, disabled: true };
  if (LEVELS.includes(envLevel)) return { level: envLevel, disabled: false };

  const upstream = readJson(join(homedir(), '.config', 'ponytail', 'config.json'));
  const upstreamLevel = upstream?.defaultMode;
  if (upstreamLevel === 'off') return { level: null, disabled: true };
  if (LEVELS.includes(upstreamLevel)) return { level: upstreamLevel, disabled: false };

  return { level: 'full', disabled: false };
}

export function ruleset() {
  const root = pluginRoot();
  if (!root) return null;
  try {
    const text = readFileSync(join(root, 'skills', 'ponytail', 'SKILL.md'), 'utf8');
    const body = text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '').trim();
    return body || null;
  } catch {
    return null;
  }
}

// Persists a level chosen in-conversation, so later sessions inherit it.
export function writeLevel(level) {
  const data = pluginData();
  if (!data) return false;
  try {
    writeFileSync(join(data, 'config.json'), JSON.stringify({ level }) + '\n', 'utf8');
    return true;
  } catch {
    return false;
  }
}

export function setDisabled(on) {
  const data = pluginData();
  if (!data) return false;
  try {
    const flag = join(data, 'disabled');
    if (on) writeFileSync(flag, '');
    else rmSync(flag, { force: true });
    return true;
  } catch {
    return false;
  }
}

// Drops the stored level so env var / upstream config / full applies again.
export function clearLevel() {
  const data = pluginData();
  if (!data) return false;
  try {
    rmSync(join(data, 'config.json'), { force: true });
    return true;
  } catch {
    return false;
  }
}
