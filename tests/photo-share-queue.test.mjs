import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { webcrypto } from 'node:crypto';

const input = fs.readFileSync(new URL('../src/services/photoSharing.ts', import.meta.url), 'utf8')
  .replace(/^import .*\n/gm, '').replaceAll('import.meta.env.VITE_SUPABASE_URL', "'https://test.supabase.co'");
const compiled = ts.transpileModule(input, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
function harness() {
  const jobs = new Map();
  const savedConfig = JSON.stringify({ kioskKey: 'k'.repeat(64), siteUrl: 'https://photobox.test' });
  const navigator = { onLine: false };
  const requests = [];
  let fail = false;
  const exports = {};
  vm.runInNewContext(compiled, {
    exports, crypto: webcrypto, Blob, AbortSignal, console, Date, URL, Event,
    location: { origin: 'https://photobox.test' }, navigator,
    localStorage: { getItem: () => savedConfig, setItem() {} },
    window: { dispatchEvent() {}, addEventListener() {}, removeEventListener() {}, setInterval, clearInterval },
    composePhotoboxLayout: async () => ({ colorBlob: new Blob(['color']), bwBlob: new Blob(['bw']) }),
    saveShareJob: async job => { jobs.set(job.id, structuredClone(job)); },
    getShareJobs: async () => Array.from(jobs.values(), job => structuredClone(job)),
    deleteShareJob: async id => { jobs.delete(id); },
    fetch: async (url, options) => {
      requests.push({ url, options });
      if (url.includes('/functions/')) {
        const body = JSON.parse(options.body);
        return { ok: true, json: async () => body.action === 'prepare' ? { ready: false, uploads: { color: 'https://storage.test/color', bw: 'https://storage.test/bw' }, expiresAt: Date.now() + 60000 } : { ready: true } };
      }
      return { ok: !fail };
    },
  });
  return { api: exports, jobs, navigator, requests, setFail: value => { fail = value; } };
}
const flush = () => new Promise(resolve => setImmediate(resolve));

test('offline accepted photos persist both files and resume upload after reopening', async () => {
  const app = harness();
  const job = await app.api.queuePhotoShare({ sessionRef: 'test' }, Date.now());
  await flush();
  assert.equal(app.jobs.get(job.id).status, 'queued');
  assert.ok(app.jobs.get(job.id).colorBlob.size > 0);
  assert.ok(app.jobs.get(job.id).bwBlob.size > 0);
  assert.equal(app.requests.length, 0);
  app.navigator.onLine = true;
  await app.api.processShareQueue();
  const completed = app.jobs.get(job.id);
  assert.equal(completed.status, 'ready');
  assert.equal(completed.colorBlob, undefined);
  assert.equal(completed.bwBlob, undefined);
  assert.equal(app.requests.filter(request => request.options.method === 'PUT').length, 2);
  assert.equal(JSON.parse(app.requests.at(-1).options.body).action, 'complete');
});
test('a failed upload retains both blobs and never publishes a partial pair', async () => {
  const app = harness();
  const job = await app.api.queuePhotoShare({ sessionRef: 'test' }, Date.now());
  await flush();
  app.navigator.onLine = true;
  app.setFail(true);
  await app.api.processShareQueue();
  assert.equal(app.jobs.get(job.id).status, 'queued');
  assert.equal(app.requests.filter(request => request.options.method === 'PUT').length, 2, 'both uploads start together, even when one fails');
  assert.ok(app.jobs.get(job.id).colorBlob);
  assert.ok(app.jobs.get(job.id).bwBlob);
  assert.equal(app.requests.some(request => typeof request.options.body === 'string' && JSON.parse(request.options.body).action === 'complete'), false);
  app.setFail(false);
  await app.api.processShareQueue();
  assert.equal(app.jobs.get(job.id).status, 'ready');
});
test('local expired queues are deleted instead of uploaded', async () => {
  const app = harness();
  const job = await app.api.queuePhotoShare({ sessionRef: 'expired' }, Date.now() - 31 * 24 * 60 * 60 * 1000);
  await flush();
  assert.equal(app.jobs.has(job.id), false);
  assert.equal(app.requests.length, 0);
});
