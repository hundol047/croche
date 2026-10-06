#!/usr/bin/env node
/**
 * Pure-TS logic test runner (no RN / no node_modules required).
 *
 * Compiles the domain/service/storage layer + __tests__ with the offline
 * verify tsconfig (which maps `zod` -> a bundled shim and `@/*` -> src), then
 * runs the Jest-compatible harness in verify/run.ts under plain node.
 *
 * This is the entrypoint for `npm run test:logic`. It works even when the npm
 * registry is unavailable, so the core learning-loop logic is always verifiable.
 * For the full suite (incl. react-native component rendering) use `npm test`
 * on a networked machine after `npm install`.
 */
const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, '.verify-out');

function run(cmd, args) {
  execFileSync(cmd, args, { cwd: root, stdio: 'inherit' });
}

// Resolve a tsc binary: prefer local node_modules, else rely on PATH.
function tscBin() {
  const local = path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'tsc.cmd' : 'tsc');
  return fs.existsSync(local) ? local : 'tsc';
}

console.log('==> Compiling pure-logic layer + tests (verify tsconfig)');
run(tscBin(), ['-p', 'verify/tsconfig.verify.json']);

console.log('==> Running logic test suite');
run(process.execPath, ['-r', path.join(root, 'verify', 'preload.js'), path.join(outDir, 'verify', 'run.js')]);
