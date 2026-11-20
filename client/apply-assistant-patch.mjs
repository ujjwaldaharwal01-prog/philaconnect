// apply-assistant-patch.mjs
// Run once from the client folder:  node apply-assistant-patch.mjs
// Adds the floating assistant button to every page by editing src/components/layout/Layout.jsx.
// (The homepage chat box is replaced by the new file src/components/home/AIPreview.jsx from the zip.)
// Safe to run twice. Backup: Layout.jsx.assistbak
import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'src/components/layout/Layout.jsx');
if (!fs.existsSync(file)) {
  console.log('\nFAILED: src/components/layout/Layout.jsx not found. Open Command Prompt inside the "client" folder and try again.\n');
  process.exit(1);
}
const original = fs.readFileSync(file, 'utf8');
if (original.includes('ChatWidget')) {
  console.log('\nAlready done. Nothing to change.\n');
  process.exit(0);
}
const eol = original.includes('\r\n') ? '\r\n' : '\n';
const footer = /(\s*)(<Footer\s*\/>)/;
if (!footer.test(original)) {
  console.log('\nFAILED: could not find <Footer /> in Layout.jsx. Send me a screenshot of Layout.jsx.\n');
  process.exit(1);
}
let out = original.replace(footer, (_m, space, tag) => `${space}${tag}${space}<ChatWidget />`);
out = `import ChatWidget from '../assistant/ChatWidget';${eol}${out}`;
fs.writeFileSync(`${file}.assistbak`, original);
fs.writeFileSync(file, out);
console.log('\nDONE. The assistant button is added. Press Ctrl + Shift + R in Chrome.\n');
