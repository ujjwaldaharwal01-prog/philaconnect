// apply-about-patch.mjs
// Run once from the client folder:  node apply-about-patch.mjs
//   1. src/App.jsx                      adds the /about route (shows the new About page)
//   2. src/components/layout/Footer.jsx (optional) updates the copyright line to your name
// Safe to run twice. Backups: <file>.aboutbak
import fs from 'node:fs';
import path from 'node:path';

let failed = 0;
function run(rel, patch, optional = false) {
  const file = path.join(process.cwd(), rel);
  if (!fs.existsSync(file)) {
    console.log(`  ${optional ? 'SKIPPED' : 'FAILED '} ${rel} (file not found; are you inside the "client" folder?)`);
    if (!optional) failed += 1;
    return;
  }
  const original = fs.readFileSync(file, 'utf8');
  const eol = original.includes('\r\n') ? '\r\n' : '\n';
  const r = patch(original, eol);
  if (r.status === 'already') return console.log(`  OK      ${rel} (already done)`);
  if (r.status === 'failed') {
    console.log(`  ${optional ? 'SKIPPED' : 'FAILED '} ${rel}: ${r.note}`);
    if (!optional) failed += 1;
    return;
  }
  if (!fs.existsSync(`${file}.aboutbak`)) fs.writeFileSync(`${file}.aboutbak`, original);
  fs.writeFileSync(file, r.text);
  console.log(`  DONE    ${rel}`);
}

console.log('\nAdding the About page...\n');

run('src/App.jsx', (text, eol) => {
  if (/pages\/About['"]/.test(text)) return { status: 'already' };
  const anchors = [/(\s*)(<Route\s+path="\/cart")/, /(\s*)(<Route\s+path="\/marketplace")/, /(\s*)(<Route\s+index[^>]*\/>)/];
  const anchor = anchors.find((a) => a.test(text));
  if (!anchor) return { status: 'failed', note: 'could not find a <Route> line.' };
  const out = text.replace(anchor, (_m, space, route) => `${space}<Route path="/about" element={<About />} />${space}${route}`);
  return { status: 'done', text: `import About from './pages/About';${eol}${out}` };
});

run(
  'src/components/layout/Footer.jsx',
  (text) => {
    if (text.includes('Ujjval Daharwal')) return { status: 'already' };
    const re = /©\s*\{new Date\(\)\.getFullYear\(\)\}\s*PHILAConnect\.[^<]*/;
    if (!re.test(text)) return { status: 'failed', note: 'copyright line not found. The About page still works.' };
    return {
      status: 'done',
      text: text.replace(re, '© {new Date().getFullYear()} Ujjval Daharwal. All rights reserved. PHILAConnect is a final-year academic project.'),
    };
  },
  true,
);

if (failed) {
  console.log(`\n${failed} step(s) failed. Send me a screenshot of this window.\n`);
  process.exit(1);
}
console.log('\nAll done. Press Ctrl + Shift + R in Chrome.\n');
