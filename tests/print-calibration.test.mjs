import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const compiled = ts.transpileModule(fs.readFileSync(new URL('../src/services/printCalibration.ts', import.meta.url), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
const api = {};
vm.runInNewContext(compiled, { exports: api, Uint8Array, Uint8ClampedArray, Float32Array, Math, btoa });
const natural = api.NEUTRAL_CALIBRATION;
function solid(width, height, gray) {
  const rgba = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < rgba.length; i += 4) rgba.set([gray, gray, gray, 255], i);
  return rgba;
}
const mean = data => data.filter((_, i) => i % 4 === 0).reduce((sum, value) => sum + value, 0) / (data.length / 4);

test('neutral calibration preserves grayscale and leaves source pixels untouched', () => {
  for (const gray of [0, 32, 96, 128, 192, 255]) {
    const source = solid(8, 8, gray);
    const before = source.slice();
    assert.equal(mean(api.calibratePixels(source, 8, 8, natural)), gray);
    assert.deepEqual(source, before);
  }
});

test('brightness, contrast, and gamma each influence the preview while paper stays white', () => {
  const source = solid(8, 8, 64);
  for (const patch of [{ brightness: 1.15 }, { contrast: 0.7 }, { gamma: 1.4 }]) {
    assert.ok(mean(api.calibratePixels(source, 8, 8, { ...natural, ...patch })) > 64);
    assert.equal(mean(api.calibratePixels(solid(8, 8, 255), 8, 8, { ...natural, ...patch })), 255);
  }
});

test('photo diffusion retains tonal coverage; threshold mode has no gray pixels', () => {
  const source = solid(128, 128, 96);
  const diffusion = api.calibratePixels(source, 128, 128, { ...natural, method: 'diffusion' });
  assert.ok(Math.abs(mean(diffusion) - 96) < 3);
  assert.ok(diffusion.every(value => value === 0 || value === 255));
  assert.equal(mean(api.calibratePixels(source, 128, 128, { ...natural, method: 'threshold' })), 0);
  assert.equal(mean(api.calibratePixels(source, 128, 128, { ...natural, method: 'threshold', threshold: 80 })), 255);
});

test('ESC/POS raster packs black pixels most-significant-bit first and includes feed/cut', () => {
  const pixels = solid(8, 2, 255);
  for (const x of [0, 2, 4, 6]) pixels.set([0, 0, 0, 255], x * 4);
  for (let x = 0; x < 4; x++) pixels.set([0, 0, 0, 255], (8 + x) * 4);
  const bytes = api.encodeEscPosRaster(pixels, 8, 2, 2, true);
  assert.deepEqual(Array.from(bytes), [27, 64, 27, 97, 1, 29, 118, 48, 0, 1, 0, 2, 0, 170, 240, 27, 100, 2, 29, 86, 66, 0]);
});

test('long comparison strips split into contiguous raster chunks with a single cut', () => {
  const bytes = Array.from(api.encodeEscPosRaster(solid(8, 300, 255), 8, 300, 0, true));
  assert.deepEqual(bytes.slice(5, 13), [29, 118, 48, 0, 1, 0, 0, 1]);
  assert.deepEqual(bytes.slice(269, 277), [29, 118, 48, 0, 1, 0, 44, 0]);
  assert.deepEqual(bytes.slice(-7), [27, 100, 0, 29, 86, 66, 0]);
  assert.equal(bytes.length, 5 + 16 + 300 + 7);
  assert.throws(() => api.encodeEscPosRaster(solid(9, 1, 0), 9, 1));
});

test('raw conversion does not apply saved tone adjustments twice', async () => {
  const original = solid(8, 8, 96);
  let previewPixels = original;
  const outputs = [];
  class FakeImage {
    naturalWidth = 8;
    naturalHeight = 8;
    set src(_value) { this.onload(); }
  }
  const testApi = {};
  vm.runInNewContext(compiled, {
    exports: testApi, Uint8Array, Uint8ClampedArray, Float32Array, Math, btoa,
    Image: FakeImage,
    document: { createElement: () => ({ width: 0, height: 0, getContext: () => ({
      drawImage() {},
      getImageData: (_x, _y, width, height) => ({ data: solid(width, height, previewPixels[0]) }),
    }) }) },
  });
  for (const brightness of [1, 1.4]) {
    outputs.push(await testApi.pngToEscPos('png', { rasterDotWidth: 384, feedLines: 2, qzFeedAndCut: false, printCalibration: { ...natural, brightness } }));
  }
  assert.equal(outputs[0], outputs[1]);
});

test('saved ESC/POS selection survives reloading settings', () => {
  const code = ts.transpileModule(fs.readFileSync(new URL('../src/services/storage.ts', import.meta.url), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const storageApi = {};
  vm.runInNewContext(code, {
    exports: storageApi, navigator: { userAgent: 'Windows' }, window: { location: { protocol: 'https:' } }, console,
    localStorage: { getItem: () => JSON.stringify({ qzUseRawEscpos: true, printerMode: 'windows-qz', printCalibration: { ...natural, contrast: 0.75 } }) },
  });
  const loaded = storageApi.loadSettings();
  assert.equal(loaded.qzUseRawEscpos, true);
  assert.equal(loaded.printCalibration.contrast, 0.75);
});
