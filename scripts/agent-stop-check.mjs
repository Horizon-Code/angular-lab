#!/usr/bin/env node
// Claude Code "Stop" hook: when an agent says it is done, run the cheap sensors.
// Exit code 2 blocks the stop and sends the failure back to the agent to fix.
// Guard: if the agent is already continuing because of this hook, let it stop
// (avoids an endless loop; CI still runs the same checks).
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

let input = {};
try {
  input = JSON.parse(readFileSync(0, 'utf8') || '{}');
} catch {
  /* no stdin: running by hand */
}
if (input.stop_hook_active) process.exit(0);

const checks = [
  ['Architecture boundaries (Sheriff)', 'npx sheriff verify'],
  ['Domain rules (Vitest)', 'npm run --silent test:domain'],
];

for (const [name, cmd] of checks) {
  try {
    execSync(cmd, { stdio: 'pipe', encoding: 'utf8' });
  } catch (error) {
    const out = `${error.stdout ?? ''}${error.stderr ?? ''}`.trim().split('\n').slice(-40).join('\n');
    process.stderr.write(`Stop check failed: ${name}\n$ ${cmd}\n${out}\nFix it before finishing.\n`);
    process.exit(2);
  }
}
process.exit(0);
