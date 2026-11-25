#!/usr/bin/env node
// Cross-platform equivalent of the mobile build pipeline. The old inline
// VITE_MOBILE=1 form only works in POSIX shells, while Windows is a supported
// Capacitor development environment too.
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const node = process.execPath

const env = { ...loadEnv('production', resolve(root, '..'), ''), ...process.env }
const supabaseUrl = String(env.VITE_SUPABASE_URL || '').trim()
const supabaseKey = String(env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim()
if (!supabaseUrl || !supabaseKey) {
  console.error('Mobile build requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY) in the repository .env or build environment.')
  process.exit(1)
}

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', env, shell: process.platform === 'win32' && command === npx })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status || 1)
}

run(npx, ['vite', 'build'], { ...process.env, VITE_MOBILE: '1' })
run(node, ['../scripts/catalogue/stage-media.mjs', 'dist'])
run(npx, ['cap', 'sync'])
run(node, ['scripts/check-mobile-bundle.mjs'])
