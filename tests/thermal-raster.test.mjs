import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const compiled = ts.transpileModule(fs.readFileSync(new URL('../src/services/thermalRaster.ts', import.meta.url), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
const api = {};
vm.runInNewContext(compiled, { exports: api, Uint8ClampedArray, Float32Array, Math });
function sample(width, height, gray, alpha = 255) {
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < pixels.length; i += 4) pixels.set([gray, gray, gray, alpha], i);
  return pixels;
}
const average = pixels => pixels.filter((_, i) => i % 4 === 0).reduce((sum, value) => sum + value, 0) / (pixels.length / 4);

test('solid black text, white paper, and transparent margins retain their coverage', () => {
  for (const gray of [0, 255]) {
    const result = api.diffuseThermalGrayscale(sample(64, 64, gray), 64, 64);
    assert.equal(average(result), gray);
  }
  assert.equal(average(api.diffuseThermalGrayscale(sample(64, 64, 0, 0), 64, 64)), 255);
});

test('midtones retain distinct coverage rather than collapsing into black or white', () => {
  let previous = -1;
  for (const gray of [32, 64, 96, 128, 160, 192, 224]) {
    const source = sample(128, 128, gray);
    const before = source.slice();
    const output = api.diffuseThermalGrayscale(source, 128, 128, 1);
    const mean = average(output);
    assert.ok(Math.abs(mean - gray) < 3, `${gray}: printed average ${mean}`);
    assert.ok(mean > previous);
    assert.deepEqual(source, before, 'preview pixels must remain untouched');
    assert.ok(output.every((value, i) => i % 4 === 3 ? value === 255 : value === 0 || value === 255));
    previous = mean;
  }
});

test('thermal compensation reduces midtone ink without changing paper or solid text', () => {
  const source = sample(128, 128, 96);
  const natural = average(api.diffuseThermalGrayscale(source, 128, 128, 1));
  const compensated = average(api.diffuseThermalGrayscale(source, 128, 128));
  assert.ok(compensated > natural + 10);
  assert.ok(compensated < 140);
});
