// apply-orders-patch.mjs
// Run once from the client folder:  node apply-orders-patch.mjs
//
// Connects checkout, order pages and the profile page WITHOUT touching your login code:
//   1. src/App.jsx   adds the routes /checkout, /orders/:id and /profile
//   2. src/components/layout/Navbar.jsx   (optional) makes "Hi, name" a link to /profile
//
// Safe to run twice. Each file is backed up the first time as <name>.ordersbak.

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
let failed = 0;

function run(rel, patch, { optional = false } = {}) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    console.log(`  ${optional ? 'SKIPPED' : 'FAILED '}  ${rel}\n          File not found. Make sure you are inside the "client" folder.`);
    if (!optional) failed += 1;
    return;
  }
  const original = fs.readFileSync(file, 'utf8');
  const eol = original.includes('\r\n') ? '\r\n' : '\n';
  const result = patch(original, eol);

  if (result.status === 'already') {
    console.log(`  OK      ${rel} (already done)`);
    return;
  }
  if (result.status === 'failed') {
    console.log(`  ${optional ? 'SKIPPED' : 'FAILED '}  ${rel}\n          ${result.note}`);
    if (!optional) failed += 1;
    return;
  }
  const backup = `${file}.ordersbak`;
  if (!fs.existsSync(backup)) fs.writeFileSync(backup, original);
  fs.writeFileSync(file, result.text);
  console.log(`  DONE    ${rel}`);
}

console.log('\nConnecting checkout, orders and profile...\n');

// 1. App.jsx: three new routes
run('src/App.jsx', (text, eol) => {
  if (text.includes('pages/Checkout')) return { status: 'already' };
  const routes = [
    '<Route path="/checkout" element={<Checkout />} />',
    '<Route path="/orders/:id" element={<OrderDetail />} />',
    '<Route path="/profile" element={<Profile />} />',
  ];
  let out;
  const anchor = /(\s*)(<Route\s+path="\/cart")/.test(text)
    ? /(\s*)(<Route\s+path="\/cart")/
    : /(\s*)(<Route\s+path="\/marketplace")/.test(text)
      ? /(\s*)(<Route\s+path="\/marketplace")/
      : null;
  if (anchor) {
    out = text.replace(anchor, (_m, space, route) => `${space}${routes.join(space)}${space}${route}`);
  } else if (/<Route\s+index[^>]*\/>/.test(text)) {
    out = text.replace(/(\s*)(<Route\s+index[^>]*\/>)/, (_m, space, route) => `${space}${route}${space}${routes.join(space)}`);
  } else {
    return { status: 'failed', note: 'Could not find a <Route> line to add the new routes next to.' };
  }
  out =
    `import Checkout from './pages/Checkout';${eol}` +
    `import OrderDetail from './pages/OrderDetail';${eol}` +
    `import Profile from './pages/Profile';${eol}` +
    out;
  return { status: 'done', text: out };
});

// 2. Navbar.jsx (optional): make "Hi, name" open the profile
run(
  'src/components/layout/Navbar.jsx',
  (text) => {
    if (text.includes('to="/profile"')) return { status: 'already' };
    const hasLink = /import\s*\{[^}]*\bLink\b[^}]*\}\s*from\s*['"]react-router-dom['"]/.test(text);
    const greeting = /Hi,\s*\{[^}]+\}/;
    if (!hasLink || !greeting.test(text)) {
      return {
        status: 'failed',
        note: 'Optional step skipped (could not find the "Hi, name" text). You can still open the profile at localhost:5173/profile.',
      };
    }
    const out = text.replace(greeting, (m) => `<Link to="/profile" className="hover:underline">${m}</Link>`);
    return { status: 'done', text: out };
  },
  { optional: true },
);

if (failed) {
  console.log(`\n${failed} step(s) failed. Take a screenshot of this window and send it to me.\n`);
  process.exit(1);
}
console.log('\nAll done. Your site will reload by itself. Press Ctrl + Shift + R in Chrome.\n');
