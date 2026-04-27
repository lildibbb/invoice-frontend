#!/usr/bin/env node
/**
 * export-openapi.mjs
 * Starts the NestJS backend, fetches /api/docs-json, saves to shared/openapi.json
 *
 * Requirements: NestJS backend must be at D:\Project\invoice-api
 * Run: node scripts/export-openapi.mjs
 */

import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BACKEND_DIR = join(ROOT, '..', 'invoice-api');
const OUTPUT_PATH = join(ROOT, 'shared', 'openapi.json');
const API_URL = 'http://localhost:3002/api/docs-json';
const HEALTH_URL = 'http://localhost:3002/api';
const MAX_WAIT_MS = 90_000;
const POLL_INTERVAL_MS = 2_000;

console.log('🚀 Starting NestJS backend to export OpenAPI spec...');
console.log(`   Backend dir: ${BACKEND_DIR}`);

// Start backend process
const backend = spawn('pnpm', ['run', 'start:dev'], {
  cwd: BACKEND_DIR,
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: true,
});

backend.stdout.on('data', (d) => {
  const line = d.toString().trim();
  if (line.includes('Nest application successfully started') ||
      line.includes('Application is running')) {
    console.log('   ✓ NestJS started');
  }
});

backend.stderr.on('data', (d) => {
  const line = d.toString().trim();
  if (line.includes('ERROR')) process.stderr.write(`   [backend] ${line}\n`);
});

// Poll health endpoint
async function waitForBackend() {
  const start = Date.now();
  while (Date.now() - start < MAX_WAIT_MS) {
    try {
      const res = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(3000) });
      if (res.ok || res.status === 401 || res.status === 404) return true;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    process.stdout.write('.');
  }
  return false;
}

try {
  const ready = await waitForBackend();
  if (!ready) {
    throw new Error(`Backend did not start within ${MAX_WAIT_MS / 1000}s`);
  }

  console.log('\n📥 Fetching OpenAPI spec...');
  const res = await fetch(API_URL, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${API_URL}`);

  const spec = await res.json();
  mkdirSync(join(ROOT, 'shared'), { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(spec, null, 2), 'utf-8');

  const endpoints = Object.keys(spec.paths ?? {}).length;
  const schemas = Object.keys(spec.components?.schemas ?? {}).length;
  console.log(`✅ OpenAPI spec saved to shared/openapi.json`);
  console.log(`   ${endpoints} endpoints, ${schemas} schemas`);
} finally {
  console.log('🛑 Stopping backend...');
  backend.kill('SIGTERM');
  await new Promise((r) => setTimeout(r, 2000));
  try { backend.kill('SIGKILL'); } catch { /* already stopped */ }
}
