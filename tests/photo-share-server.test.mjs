import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { webcrypto } from 'node:crypto';

const source = ts.transpileModule(fs.readFileSync(new URL('../supabase/functions/photo-share/index.ts', import.meta.url), 'utf8').replace(/^import .*\n/, ''), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText;
const kioskKey = 'k'.repeat(64);
const cronKey = 'c'.repeat(64);
const token = 'a'.repeat(64);
function harness(initialRow = null) {
  let row = initialRow;
  let handler;
  const calls = { signs: [], uploads: [], removed: [], updates: [], upserts: [] };
  let objects = [{ name: 'color.jpg', metadata: { size: 200 } }, { name: 'bw.jpg', metadata: { size: 180 } }];
  const storage = {
    createSignedUrl: async (path, ttl, options) => { calls.signs.push({ path, ttl, options }); return { data: { signedUrl: `https://storage.test/${path}` } }; },
    createSignedUploadUrl: async path => { calls.uploads.push(path); return { data: { signedUrl: `https://storage.test/upload/${path}` } }; },
    list: async () => ({ data: objects }),
    remove: async paths => { calls.removed.push(paths); return {}; },
  };
  const query = {
    select() { return this; }, eq() { return this; },
    async maybeSingle() { return { data: row }; },
    async upsert(value) { calls.upserts.push(value); row ||= { expires_at: value.expires_at, ready: false, deleted_at: null }; return {}; },
    update(value) { calls.updates.push(value); return { eq: async () => { row = { ...row, ...value }; return {}; } }; },
    lte() { return this; }, is() { return this; },
    async limit() { return { data: row ? [{ token_hash: 'hashed-session' }] : [] }; },
  };
  const admin = { from: () => query, storage: { from: () => storage, getBucket: async () => ({ data: { public: false } }) } };
  vm.runInNewContext(source, {
    Deno: { env: { get: name => ({ PHOTOBOX_KIOSK_KEY: kioskKey, PHOTOBOX_CRON_KEY: cronKey, SUPABASE_URL: 'https://test.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'server-only' })[name] }, serve: fn => { handler = fn; } },
    createClient: () => admin, crypto: webcrypto, TextEncoder, Response, Request, Date, console,
  });
  return {
    calls,
    setObjects: value => { objects = value; },
    request: async (body, key) => {
      const response = await handler(new Request('https://test/functions/v1/photo-share', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(key ? { Authorization: `Bearer ${key}` } : {}) }, body: JSON.stringify(body) }));
      return { status: response.status, body: await response.json(), headers: response.headers };
    },
  };
}

test('upload endpoints reject visitors without the kiosk key', async () => {
  const server = harness();
  for (const action of ['prepare', 'complete', 'health']) {
    assert.equal((await server.request({ action, token })).status, 401);
  }
  assert.equal(server.calls.uploads.length, 0);
});
test('prepare retry preserves the existing expiry and uses hashed storage paths', async () => {
  const expiry = Date.now() + 600000;
  const server = harness({ expires_at: new Date(expiry).toISOString(), ready: false });
  const result = await server.request({ action: 'prepare', token, createdAt: Date.now() }, kioskKey);
  assert.equal(result.status, 200);
  assert.equal(result.body.expiresAt, expiry);
  assert.equal(server.calls.uploads.length, 2);
  assert.ok(server.calls.uploads.every(path => !path.includes(token)));
});
test('complete only publishes a session when both images exist', async () => {
  const server = harness({ expires_at: new Date(Date.now() + 600000).toISOString(), ready: false });
  server.setObjects([{ name: 'color.jpg', metadata: { size: 200 } }]);
  assert.equal((await server.request({ action: 'complete', token }, kioskKey)).status, 409);
  assert.equal(server.calls.updates.length, 0);
  server.setObjects([{ name: 'color.jpg', metadata: { size: 200 } }, { name: 'bw.jpg', metadata: { size: 180 } }]);
  assert.equal((await server.request({ action: 'complete', token }, kioskKey)).status, 200);
  assert.equal(server.calls.updates[0].ready, true);
});
test('expired sessions cannot download even before physical cleanup', async () => {
  const server = harness({ expires_at: new Date(Date.now() - 1000).toISOString(), ready: true });
  const status = await server.request({ action: 'status', token });
  assert.equal(status.body.status, 'expired');
  assert.equal((await server.request({ action: 'download', token, variant: 'color' })).status, 410);
  assert.equal(server.calls.signs.length, 0);
});
test('signed downloads cannot outlive the remaining session lifetime', async () => {
  const server = harness({ expires_at: new Date(Date.now() + 9000).toISOString(), ready: true });
  const result = await server.request({ action: 'download', token, variant: 'bw' });
  assert.equal(result.status, 200);
  assert.ok(server.calls.signs[0].ttl <= 9 && server.calls.signs[0].ttl > 0);
  assert.equal(server.calls.signs[0].options.download, 'photobox-bw.jpg');
  assert.match(result.headers.get('cache-control'), /no-store/);
});
test('missing offline sessions return pending; cleanup requires a separate key', async () => {
  const server = harness();
  assert.equal((await server.request({ action: 'status', token })).body.status, 'pending');
  assert.equal((await server.request({ action: 'cleanup' }, kioskKey)).status, 401);
  assert.equal((await server.request({ action: 'cleanup' }, cronKey)).status, 200);
});
test('cleanup removes both image objects and preserves an expired tombstone', async () => {
  const server = harness({ expires_at: new Date(Date.now() - 10000000).toISOString(), ready: true });
  assert.equal((await server.request({ action: 'cleanup' }, cronKey)).status, 200);
  assert.equal(server.calls.removed[0].length, 2);
  assert.ok(server.calls.updates[0].deleted_at);
  assert.equal(server.calls.updates[0].ready, false);
});
