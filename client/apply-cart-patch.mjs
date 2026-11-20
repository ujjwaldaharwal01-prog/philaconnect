// apply-cart-patch.mjs
// Run once from the client folder:  node apply-cart-patch.mjs
//
// Makes the three small edits that connect the shopping cart, WITHOUT touching your login code:
//   1. src/main.jsx                        wraps <App /> in <CartProvider>
//   2. src/App.jsx                         adds the /cart route
//   3. src/components/layout/Navbar.jsx    makes the cart badge show the real item count
//
// Safe to run twice (it skips edits that are already done). Each file is backed up the first time
// as <name>.cartbak. If a line cannot be found, the script says exactly which one.

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
let failed = 0;

function run(rel, patch) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    console.log(`  FAILED  ${rel}\n          File not found. Make sure you are inside the "client" folder.`);
    failed += 1;
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
    console.log(`  FAILED  ${rel}\n          ${result.note}`);
    failed += 1;
    return;
  }
  const backup = `${file}.cartbak`;
  if (!fs.existsSync(backup)) fs.writeFileSync(backup, original);
  fs.writeFileSync(file, result.text);
  console.log(`  DONE    ${rel}`);
}

console.log('\nConnecting the shopping cart...\n');

// 1. main.jsx: wrap <App /> with the cart provider
run('src/main.jsx', (text, eol) => {
  if (text.includes('CartProvider')) return { status: 'already' };
  if (!/<App\s*\/>/.test(text)) return { status: 'failed', note: 'Could not find "<App />" in main.jsx.' };
  let out = text.replace(/<App\s*\/>/, '<CartProvider><App /></CartProvider>');
  out = `import { CartProvider } from './context/CartContext';${eol}${out}`;
  return { status: 'done', text: out };
});

// 2. App.jsx: add the /cart route (before the marketplace route so it wins over the "coming soon" page)
run('src/App.jsx', (text, eol) => {
  if (text.includes('pages/Cart')) return { status: 'already' };
  const routeLine = '<Route path="/cart" element={<Cart />} />';
  let out;
  if (/<Route\s+path="\/marketplace"/.test(text)) {
    out = text.replace(/(\s*)(<Route\s+path="\/marketplace")/, `$1${routeLine}$1$2`);
  } else if (/<Route\s+index[^>]*\/>/.test(text)) {
    out = text.replace(/(\s*)(<Route\s+index[^>]*\/>)/, `$1$2$1${routeLine}`);
  } else {
    return { status: 'failed', note: 'Could not find the marketplace or index <Route> line in App.jsx.' };
  }
  out = `import Cart from './pages/Cart';${eol}${out}`;
  return { status: 'done', text: out };
});

// 3. Navbar.jsx: real cart count instead of the fixed 0
run('src/components/layout/Navbar.jsx', (text, eol) => {
  if (text.includes('useCart')) return { status: 'already' };
  const re = /const\s+cartCount\s*=\s*[^;\n]+;/;
  if (!re.test(text)) {
    return { status: 'failed', note: 'Could not find the line "const cartCount = 0;" in Navbar.jsx.' };
  }
  let out = text.replace(re, 'const { itemCount: cartCount } = useCart();');
  out = `import { useCart } from '../../context/CartContext';${eol}${out}`;
  return { status: 'done', text: out };
});

if (failed) {
  console.log(`\n${failed} step(s) failed. Take a screenshot of this window and send it to me.\n`);
  process.exit(1);
}
console.log('\nAll done. Your site will reload by itself. Press Ctrl + Shift + R in Chrome.\n');
