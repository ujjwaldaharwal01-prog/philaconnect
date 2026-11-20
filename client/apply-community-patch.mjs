// apply-community-patch.mjs
// Run once from the client folder:  node apply-community-patch.mjs
// Adds the routes /community, /community/:id and /communities to src/App.jsx. Safe to run twice and whether or
// not you installed the earlier Community page (backup: App.jsx.commbak).
import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'src/App.jsx');
if (!fs.existsSync(file)) {
  console.log('\nFAILED: src/App.jsx not found. Open Command Prompt inside the "client" folder and try again.\n');
  process.exit(1);
}
const original = fs.readFileSync(file, 'utf8');
const eol = original.includes('\r\n') ? '\r\n' : '\n';
let out = original;
const imports = [];
const routes = [];
if (!/pages\/Community['"]/.test(out)) {
  imports.push("import Community from './pages/Community';");
  routes.push('<Route path="/community" element={<Community />} />');
}
if (!out.includes('pages/CommunityPost')) {
  imports.push("import CommunityPost from './pages/CommunityPost';");
  routes.push('<Route path="/community/:id" element={<CommunityPost />} />');
}
if (!out.includes('pages/Communities')) {
  imports.push("import Communities from './pages/Communities';");
  routes.push('<Route path="/communities" element={<Communities />} />');
}
if (routes.length === 0) {
  console.log('\nAlready done. Nothing to change.\n');
  process.exit(0);
}
const anchors = [/(\s*)(<Route\s+path="\/cart")/, /(\s*)(<Route\s+path="\/marketplace")/, /(\s*)(<Route\s+index[^>]*\/>)/];
const anchor = anchors.find((a) => a.test(out));
if (!anchor) {
  console.log('\nFAILED: could not find a <Route> line in App.jsx. Send me a screenshot of App.jsx.\n');
  process.exit(1);
}
out = out.replace(anchor, (_m, space, route) => `${space}${routes.join(space)}${space}${route}`);
out = imports.join(eol) + eol + out;
if (!fs.existsSync(`${file}.commbak`)) fs.writeFileSync(`${file}.commbak`, original);
fs.writeFileSync(file, out);
console.log('\nDONE. Community routes are connected. Press Ctrl + Shift + R in Chrome.\n');
