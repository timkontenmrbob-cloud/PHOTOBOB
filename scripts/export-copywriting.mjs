import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const walkFiles = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walkFiles(path.join(directory, entry.name)) : /\.tsx?$/.test(entry.name) ? [path.join(directory, entry.name)] : []);
const files = [...walkFiles('src'), ...walkFiles('supabase/functions')].filter(file => !/vite-env|types\/|services\/(db|wakelock|photoDownload)\.ts$/.test(file));
const entries = [];
const normalize = text => text.replace(/\s+/g, ' ').trim();
const inline = new Set(['span', 'b', 'strong', 'em', 'i', 'code', 'a', 'small']);
const labels = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'p', 'button', 'label', 'option', 'a', 'span', 'div', 'figcaption']);
const visibleAttributes = new Set(['alt', 'title', 'placeholder', 'aria-label']);
function group(file) {
  if (file.includes('AdminSettingsScreen') || file.includes('PhotoSharingSettings')) return '02 — Admin dan pengaturan';
  if (file.includes('/services/') || file.includes('/context/') || file.includes('/supabase/')) return '03 — Pesan sistem, printer, kamera, dan teks cetak';
  return '01 — Halaman pengunjung';
}
function expressionText(node, source) {
  if (ts.isStringLiteralLike(node)) return node.text;
  if (ts.isTemplateExpression(node)) return node.head.text + node.templateSpans.map(span => '{' + normalize(span.expression.getText(source)) + '}' + span.literal.text).join('');
  const raw = normalize(node.getText(source));
  if (/toLocale|new Date/.test(raw)) return '{tanggal}';
  if (/qzPrinterName|printerName|targetPrinter/.test(raw)) return '{nama printer}';
  if (/frame\.name|selectedFrame\.name/.test(raw)) return '{nama bingkai}';
  if (/appTitle/.test(raw)) return '{nama photobox}';
  return '{' + raw + '}';
}
for (const file of files) {
  const sourceText = fs.readFileSync(file, 'utf8');
  const source = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true, file.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const covered = [];
  const add = (node, text, kind) => {
    text = normalize(text);
    if (!text || /^[\W\d_]+$/u.test(text) || /^\{[^{}]+\}$/.test(text)) return;
    const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
    if (!entries.some(entry => entry.file === file && entry.text === text && entry.kind === kind)) entries.push({ file, line, text, kind, group: group('/' + file) });
  };
  const flatten = node => {
    let output = '';
    let hasLiteral = false;
    for (const child of node.children) {
      if (ts.isJsxText(child)) { output += child.text; if (normalize(child.text)) hasLiteral = true; }
      else if (ts.isJsxElement(child) && inline.has(child.openingElement.tagName.getText(source))) {
        const value = flatten(child); if (!value) return null;
        output += value.text; hasLiteral ||= value.hasLiteral;
      } else if (ts.isJsxSelfClosingElement(child)) {
        const tag = child.tagName.getText(source);
        if (tag === 'br') output += ' ';
        else if (!/^[A-Z]/.test(tag) && !['input'].includes(tag)) return null;
      } else if (ts.isJsxExpression(child)) {
        if (!child.expression) continue;
        const expression = child.expression;
        if ((ts.isConditionalExpression(expression) || ts.isBinaryExpression(expression)) && !hasLiteral) return null;
        output += expressionText(expression, source);
        if (ts.isStringLiteralLike(expression) || ts.isTemplateExpression(expression)) hasLiteral = true;
      } else return null;
    }
    return hasLiteral ? { text: output, hasLiteral } : null;
  };
  function visit(node) {
    const alreadyCovered = covered.some(([start, end]) => node.pos >= start && node.end <= end);
    if (!alreadyCovered && ts.isJsxElement(node) && labels.has(node.openingElement.tagName.getText(source))) {
      const value = flatten(node);
      if (value) {
        add(node, value.text, 'Tampilan');
        for (const child of node.children) covered.push([child.pos, child.end]);
      }
    }
    if (ts.isJsxAttribute(node) && visibleAttributes.has(node.name.getText(source)) && node.initializer && ts.isStringLiteral(node.initializer)) add(node, node.initializer.text, node.name.getText(source) === 'placeholder' ? 'Placeholder' : 'Aksesibilitas / petunjuk');
    if (ts.isJsxText(node) && normalize(node.text) && !covered.some(([start, end]) => node.pos >= start && node.end <= end)) add(node, node.text, 'Tampilan');
    if ((ts.isStringLiteralLike(node) || ts.isTemplateExpression(node)) && !covered.some(([start, end]) => node.pos >= start && node.end <= end)) {
      let enclosingAttribute;
      for (let ancestor = node.parent; ancestor && !ts.isSourceFile(ancestor); ancestor = ancestor.parent) {
        if (ts.isJsxAttribute(ancestor)) { enclosingAttribute = ancestor.name.getText(source); break; }
      }
      if (enclosingAttribute && !visibleAttributes.has(enclosingAttribute) && !/^on[A-Z]/.test(enclosingAttribute)) { ts.forEachChild(node, visit); return; }
      let allowed = false;
      let kind = 'Status / pesan';
      let parent = node.parent;
      let blocked = false;
      while (parent && !ts.isSourceFile(parent)) {
        if (ts.isJsxAttribute(parent)) { if (visibleAttributes.has(parent.name.getText(source))) { allowed = true; kind = parent.name.getText(source) === 'placeholder' ? 'Placeholder' : 'Aksesibilitas / petunjuk'; } break; }
        if (ts.isImportDeclaration(parent) || ts.isTypeNode(parent)) { blocked = true; break; }
        if (ts.isBinaryExpression(parent) && ['===', '!==', '==', '!='].includes(parent.operatorToken.getText(source))) { blocked = true; break; }
        if (ts.isCallExpression(parent)) {
          const callee = parent.expression.getText(source);
          if (/^(console\.|localStorage\.|sessionStorage\.)/.test(callee)) { blocked = true; break; }
          if (/^(set.*(?:Message|Error|Status)|alert|confirm|useState)$/.test(callee) && /[\s.!?…]/u.test(expressionText(node, source))) allowed = true;
          if (/\.fillText$/.test(callee) && parent.arguments[0] && node.pos >= parent.arguments[0].pos && node.end <= parent.arguments[0].end) { allowed = true; kind = 'Teks pada cetakan'; }
        }
        if (ts.isNewExpression(parent) && /Error$/.test(parent.expression.getText(source))) allowed = true;
        if (ts.isPropertyAssignment(parent) || ts.isPropertyDeclaration(parent) || ts.isVariableDeclaration(parent)) {
          const name = parent.name?.getText(source) || '';
          if (/^(errorMessage|printErrorMessage|errorFix|error|info|name|styleName|appTitle|headerText|footerText|subFooter|fix|detail|targetPrinterName)$/.test(name)) allowed = true;
        }
        if (ts.isBinaryExpression(parent) && parent.operatorToken.kind === ts.SyntaxKind.EqualsToken && /^(fix|subFooter)$/.test(parent.left.getText(source))) allowed = true;
        if (ts.isReturnStatement(parent) && file.includes('/services/') && /\s/.test(expressionText(node, source))) allowed = true;
        if (ts.isJsxExpression(parent) && !enclosingAttribute) { allowed = true; kind = 'Tampilan / teks dinamis'; break; }
        parent = parent.parent;
      }
      if (allowed && !blocked) {
        let text = expressionText(node, source);
        if (/<html|<!DOCTYPE/i.test(text)) {
          // Print-only HTML: collect visible text, not its styles or scripts.
          text = text.replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ');
          kind = 'Teks dialog / cetak';
        }
        if (/\.(jpg|jpeg|png|zip)$/.test(text) || /\/download#|within a PhotoboxProvider/.test(text)) { ts.forEachChild(node, visit); return; }
        if (!/^(id-ID|idle|error|success|printing|confirming|queued|ready|loading|pending|expired|both|color|bw|png|image\/.*|https?:\/\/.*|GET|POST|PUT|OPTIONS|true|false|left|right|center|none|text|image|feed|divider|localhost|[0-9.]+|#\w+)$/.test(text) && !/^(className|onClick|style)$/.test(node.parent?.name?.getText(source) || '')) add(node, text, kind);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}
entries.sort((a,b) => a.group.localeCompare(b.group) || files.indexOf(a.file) - files.indexOf(b.file) || a.line - b.line);
const visitorOrder = ['src/screens/WelcomeScreen.tsx','src/screens/FrameSelectionScreen.tsx','src/screens/CameraScreen.tsx','src/screens/PhotoPreviewScreen.tsx','src/screens/PrintingScreen.tsx','src/screens/SuccessScreen.tsx','src/components/PhotoSharePanel.tsx','src/screens/DownloadScreen.tsx','src/components/Header.tsx','src/components/AdminPinModal.tsx'];
entries.sort((a,b) => a.group.localeCompare(b.group) || (a.group.startsWith('01') ? visitorOrder.indexOf(a.file)-visitorOrder.indexOf(b.file) : files.indexOf(a.file)-files.indexOf(b.file)) || a.line-b.line);
const escape = value => value.replace(/\|/g, '\\|').replace(/</g, '&lt;').replace(/>/g, '&gt;');
let markdown = '# Daftar Copywriting PHOTOBOX — Untuk Revisi\n\n';
markdown += 'Daftar teks saat ini dari source website, termasuk halaman pengunjung, Admin, pesan sistem, aksesibilitas, dan teks cetak bawaan. Tidak termasuk komentar kode, log developer, nama berkas/endpoint, isi respons error dari browser/perangkat di luar aplikasi, atau tulisan yang sudah menjadi bagian gambar frame. Label teknis yang benar-benar tampil di Admin tetap dicantumkan.\n\n';
markdown += '**Cara edit:** isi kolom **Bahasa revisi** atau kirim revisi menggunakan ID, misalnya `CW001 → teks pengganti`. Kosong berarti tetap. Teks di dalam `{...}` adalah data otomatis (tanggal, hitungan, nama printer, dan sebagainya); pertahankan maknanya saat mengedit. Nama layanan/model printer dan ukuran teknis sebaiknya tetap akurat.\n\n';
markdown += '**Tampilan download yang baru:** dua preview, masing-masing tombol **Download** tepat di bawah foto, masing-masing mengunduh satu JPG; tanpa tombol download gabungan atau ZIP. Tulisan B&W/full color dipertahankan sebagai deskripsi aksesibilitas untuk pembaca layar, tidak sebagai label tombol yang terlihat.\n\n';
markdown += 'Nomor ID hanya untuk dokumen ini. Teks yang sama di lokasi berbeda dapat tercantum lagi karena konteksnya berbeda. Untuk perubahan bahasa publik, mulai dari bagian **01**.\n\n';
let previousGroup='',previousFile='';
entries.forEach((entry,index) => {
  const id='CW'+String(index+1).padStart(3,'0');
  entry.id=id;
  if(entry.group!==previousGroup){markdown+='## '+entry.group+'\n\n';previousGroup=entry.group;previousFile='';}
  if(entry.file!==previousFile){markdown+='### '+entry.file+'\n\n| ID | Teks saat ini | Bahasa revisi | Jenis / baris sumber |\n| --- | --- | --- | --- |\n';previousFile=entry.file;}
  markdown+=`| ${id} | ${escape(entry.text)} |  | ${entry.kind} · ${entry.line} |\n`;
  const next=entries[index+1];if(!next || next.file!==entry.file)markdown+='\n';
});
markdown+='Total: **'+entries.length+' entri**.\n';
fs.writeFileSync('COPYWRITING_REVIEW.md',markdown);
fs.writeFileSync('/tmp/photobox-copywriting.json',JSON.stringify(entries,null,2));
console.log(JSON.stringify({entries:entries.length,byGroup:Object.fromEntries([...new Set(entries.map(e=>e.group))].map(g=>[g,entries.filter(e=>e.group===g).length])),output:path.join(root,'COPYWRITING_REVIEW.md')},null,2));
