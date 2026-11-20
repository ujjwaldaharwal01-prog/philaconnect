// apply-recommendations-patch.mjs
// Run once from the client folder:  node apply-recommendations-patch.mjs
// Adds the /recommendations route to src/App.jsx. Safe to run twice (backup: App.jsx.recobak).
import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'src/App.jsx');
if (!fs.existsSync(file)) {
  console.log('\nFAILED: src/App.jsx not found. Open Command Prompt inside the "client" folder and try again.\n');
  process.exit(1);
}
const original = fs.readFileSync(file, 'utf8');
if (original.includes('pages/Recommendations')) {
  console.log('\nAlready done. Nothing to change.\n');
  process.exit(0);
}
const eol = original.includes('\r\n') ? '\r\n' : '\n';
const anchor = /(\s*)(<Route\s+path="\/cart")/.test(original)
  ? /(\s*)(<Route\s+path="\/cart")/
  : /(\s*)(<Route\s+path="\/marketplace")/.test(original)
    ? /(\s*)(<Route\s+path="\/marketplace")/
    : /(\s*)(<Route\s+index[^>]*\/>)/;
if (!anchor.test(original)) {
  console.log('\nFAILED: could not find a <Route> line in App.jsx. Send me a screenshot of App.jsx.\n');
  process.exit(1);
}
let out = original.replace(anchor, (_m, space, route) => `${space}<Route path="/recommendations" element={<Recommendations />} />${space}${route}`);
out = `import Recommendations from './pages/Recommendations';${eol}${out}`;
fs.writeFileSync(`${file}.recobak`, original);
fs.writeFileSync(file, out);
console.log('\nDONE. /recommendations is connected. Press Ctrl + Shift + R in Chrome.\n');
