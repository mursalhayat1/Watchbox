/**
 * Admin RPC diagnostic probe (read-only).
 *
 * Uses the browser-safe anon key to answer:
 *   1. What exact status + error body does calling each admin RPC return?
 *      (read-only aggregate functions, safe to call with {} as anon;
 *       an admin guard raising 'Unauthorized' is the expected/harmless outcome)
 *
 * Key diagnostic pattern:
 *   - 401/403 {"code":"42501","message":"permission denied for function X"}
 *       -> the function EXISTS but EXECUTE is not granted to this role.
 *   - 404 PGRST202 "not found in schema cache"
 *       -> the function does not exist at all (e.g. fresh environment).
 *   - 200 (boolean/array/jsonb)
 *       -> the function executes for this role.
 *
 * AFTER applying 00018_admin_rpc_function_grants.sql, expected output as anon:
 *   - is_admin                     -> 200 false  (this also verifies the fix!)
 *   - every admin_* probe          -> 401 42501  (anon denied BY DESIGN)
 *   - admin_media_distribution /
 *     admin_status_distribution    -> 404 PGRST202 (probes for nonexistent
 *     names, kept for contrast)
 * The definitive verification is the browser: /admin must render without 403s.
 *
 * Never prints keys. Only the project URL host and page data.
 *
 * Usage: node scripts\diagnostics\admin-rpc-probe.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..', '..');
const ENV_FILES = ['.env', '.env.local', '.env.example'];

const URL_KEYS = ['VITE_SUPABASE_URL', 'SUPABASE_URL'];
const KEY_KEYS = ['VITE_SUPABASE_ANON_KEY', 'VITE_SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_ANON_KEY'];

let SUPABASE_URL, SUPABASE_ANON_KEY;
const pickFirst = (keys) => {
  for (const file of ENV_FILES) {
    const p = resolve(ROOT, file);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const v = m[2].trim().replace(/^['"]|["']$/g, '');
      if (v && keys.includes(m[1])) return v;
    }
  }
  return undefined;
};
SUPABASE_URL = pickFirst(URL_KEYS);
SUPABASE_ANON_KEY = pickFirst(KEY_KEYS);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_ANON_KEY in', ENV_FILES.join(', '));
  process.exit(1);
}

const host = new URL(SUPABASE_URL).host;
console.log('Probing project:', host, '\n');

const hdr = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` };

// ── 1. OpenAPI introspection ───────────────────────────────────────────────────
const specRes = await fetch(`${SUPABASE_URL}/rest/v1/`, { headers: hdr });
const spec = await specRes.json().catch(() => null);
const rpcPaths = Object.keys(spec?.paths ?? {})
  .filter(p => p.startsWith('/rpc/'))
  .map(p => p.slice(5));
console.log(`OpenAPI spec: status=${specRes.status} title=${spec?.info?.title ?? '(none)'}`);
const pathList = Object.keys(spec?.paths ?? {});
console.log(`(spec total paths=${pathList.length}; sample: ${pathList.filter(p => !p.startsWith('/rpc')).slice(0, 5).join(', ')})`);
const adminPaths = rpcPaths.filter(p => p.toLowerCase().includes('admin'));
console.log('\nRPCs exposed to anon role (filtered to admin*):');
console.log(adminPaths.length ? adminPaths.join('\n') : '  (none)');
console.log(`(total ${rpcPaths.length} rpcs exposed to anon)\n`);

// ── 2. Call each RPC used by the admin client ─────────────────────────────────
const PROBES = [
  ['admin_get_stats', {}],
  ['admin_get_user_growth', { p_days: 30 }],
  ['admin_get_activity', { p_days: 30 }],
  ['admin_get_top_titles', { p_limit: 10, p_media_type: null }],
  ['admin_media_distribution', {}],
  ['admin_get_media_distribution', {}],
  ['admin_status_distribution', {}],
  ['admin_get_status_distribution', {}],
  ['admin_list_users', { p_limit: 1, p_offset: 0 }],
  ['admin_get_user_details', { p_user_id: '00000000-0000-0000-0000-000000000000' }],
  ['admin_get_watch_data', { p_table: 'library_items', p_search: null, p_limit: 1, p_offset: 0 }],
  ['admin_get_audit_logs', { p_limit: 1, p_offset: 0 }],
  ['admin_log_action', { p_action: 'diagnostic_probe' }],
  ['is_admin', {}],
];

for (const [fn, body] of PROBES) {
  let status, payload;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: { ...hdr, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    status = res.status;
    payload = await res.json().catch(() => '(non-JSON)');
  } catch (e) {
    status = 'FETCH_ERR';
    payload = String(e);
  }
  let summary;
  if (Array.isArray(payload)) summary = `array[${payload.length}] e.g. ${JSON.stringify(payload[0])?.slice(0, 120)}`;
  else summary = JSON.stringify(payload)?.slice(0, 200);
  console.log(`${fn}\n   -> ${status} ${summary}`);
}

// ── 3. Contrast: a normal user table readable by anon/authenticated? ──────────
try {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id,role&limit=1`, { headers: hdr });
  const b = await res.json().catch(() => '');
  console.log(`\nprofiles direct query via anon -> ${res.status} ${JSON.stringify(b).slice(0, 200)}`);
} catch { /* ignore */ }
