import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import sharp from 'sharp';

const compiled = ts.transpileModule(fs.readFileSync(new URL('../src/services/printers/QZTrayPrinter.ts', import.meta.url), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
function harness(failure) {
  const jobs = [];
  const qz = {
    websocket: { isActive: () => true, setClosedCallbacks() {}, setErrorCallbacks() {} },
    printers: { find: async () => 'iWare IW D260UL' },
    configs: { create: (name, options) => ({ name, options }) },
    print: async (config, data) => {
      jobs.push({ config, data });
      if (failure) throw new Error(failure);
    },
  };
  const rawRequests = [];
  const api = {};
  vm.runInNewContext(compiled, {
    exports: api, require: name => name === 'qz-tray' ? ({ default: qz }) : ({ pngToEscPos: async (...args) => { rawRequests.push(args); return 'RAW_COMMAND_BYTES'; } }), atob,
    console: { log() {}, warn() {}, error() {} }, setTimeout, clearTimeout,
    window: { print() { assert.fail('QZ must never open Chrome print'); } },
  });
  return { printer: new api.QZTrayPrinter(), jobs, rawRequests };
}
const settings = { printOriginalPhoto: false, windowsPaperWidthMm: 80, windowsPrintableWidthMm: 72, qzPrinterName: 'iWare IW D260UL' };
const png = (await sharp({ create: { width: 576, height: 190, channels: 3, background: '#fff' } }).png().toBuffer()).toString('base64');

test('QZ sends unchanged PNG through Windows driver instead of raw image conversion', async () => {
  const app = harness();
  const result = await app.printer.print({ base64Image: `data:image/png;base64,${png}`, settings, sessionRef: 'test' });
  assert.equal(result.success, true);
  assert.equal(app.jobs.length, 1);
  const { config, data } = app.jobs[0];
  assert.equal(data.length, 1);
  assert.equal(data[0].type, 'pixel');
  assert.equal(data[0].flavor, 'base64');
  assert.equal(data[0].data, png);
  assert.equal(config.options.colorType, 'grayscale');
  assert.equal(config.options.size.width, 80);
  assert.equal(config.options.size.height, 23.8);
  assert.equal(data[0].options, undefined, 'no raw quantization or dithering');
});

test('invalid PNG never reaches printer', async () => {
  const app = harness();
  const result = await app.printer.print({ base64Image: 'not-a-png', settings, sessionRef: 'test' });
  assert.equal(result.success, false);
  assert.equal(result.errorMessage, 'Gambar cetak PNG tidak valid.');
  assert.equal(app.jobs.length, 0);
});

test('image parsing failure is not reported as a disconnected printer', async () => {
  const app = harness('Cannot parse (BASE64)example as an image');
  const result = await app.printer.print({ base64Image: png, settings, sessionRef: 'test' });
  assert.equal(result.success, false);
  assert.equal(result.errorMessage, 'QZ Tray gagal membaca gambar cetak.');
  assert.ok(!result.errorFix.includes('kabel'));
});


test('ESC/POS route sends prepacked command bytes, never raw IMAGE conversion', async () => {
  const app = harness();
  const result = await app.printer.print({ base64Image: png, settings: { ...settings, qzUseRawEscpos: true }, sessionRef: 'raw-test' });
  assert.equal(result.success, true);
  assert.equal(app.rawRequests.length, 1);
  assert.equal(app.rawRequests[0][0], png);
  assert.equal(app.jobs[0].data[0].type, 'raw');
  assert.equal(app.jobs[0].data[0].format, 'command');
  assert.equal(app.jobs[0].data[0].data, 'RAW_COMMAND_BYTES');
  assert.equal(app.jobs[0].data.length, 1);
});


test('original-photo mode sends camera colors to Windows without forcing grayscale', async () => {
  const app = harness();
  const result = await app.printer.print({ base64Image: png, settings: { ...settings, printOriginalPhoto: true }, sessionRef: 'original' });
  assert.equal(result.success, true);
  assert.equal(app.jobs[0].config.options.colorType, 'color');
  assert.equal(app.jobs[0].data[0].data, png);
});
