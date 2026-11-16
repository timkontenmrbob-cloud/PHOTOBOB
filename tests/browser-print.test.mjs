import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const compiled = ts.transpileModule(fs.readFileSync(new URL('../src/services/printers/WindowsBrowserPrinter.ts', import.meta.url), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;

test('USB prints the preview image unchanged, without adding texture or tonal processing', async () => {
  const nodes = new Map();
  const image = { src: '', complete: true, naturalWidth: 1080, naturalHeight: 1440, decode: async () => {} };
  const source = 'data:image/png;base64,UNCHANGED_GRAYSCALE';
  let printed = false;
  const document = {
    getElementById: id => nodes.get(id),
    createElement: tag => {
      assert.notEqual(tag, 'canvas', 'printing must not reprocess preview pixels');
      return {
        querySelector: () => image,
        set innerHTML(html) { image.src = html.match(/src="([^"]+)"/)[1]; },
      };
    },
    body: { appendChild: node => nodes.set(node.id, node) },
    head: { appendChild: node => nodes.set(node.id, node) },
  };
  const api = {};
  vm.runInNewContext(compiled, {
    exports: api, document, console,
    setTimeout: callback => callback(),
    window: { print: () => {
      assert.equal(image.src, source);
      printed = true;
    } },
  });
  const result = await new api.WindowsBrowserPrinter().print({
    previewUrl: source, sessionRef: 'test',
    settings: { windowsPaperWidthMm: 80, windowsPrintableWidthMm: 72 },
  });
  assert.equal(result.success, true);
  assert.equal(printed, true);
  const css = nodes.get('photobox-print-dynamic-styles').textContent;
  assert.ok(css.includes('size: 80mm 96mm;'));
  assert.ok(css.includes('image-rendering: auto;'));
  assert.ok(!css.includes('pixelated'));
  assert.ok(!css.includes('filter:'));
});
