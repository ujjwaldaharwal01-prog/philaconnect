// setup-chat.js
// Run ONCE from the server folder:   node setup-chat.js
//
// 1. Makes sure the COMMUNITY tables exist (community_posts, community_comments). If your
//    discussion board shows "Server error while loading discussions", this fixes it.
// 2. Creates the CHAT tables: chat_profiles (nicknames), chat_messages, chat_reports.
// 3. Connects /api/community and /api/chat to your server.js by adding lines (backup saved as
//    server.js.chatbak). Lines that are already there are left alone.
// Safe to run again: it only creates what is missing and never deletes any data.

const fs = require('fs');
const path = require('path');
const pool = require('./db');

const ID_TYPES = { integer: 'INTEGER', bigint: 'BIGINT', smallint: 'SMALLINT', uuid: 'UUID' };

async function createTables() {
  const col = await pool.query(
    `SELECT data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id' LIMIT 1`,
  );
  if (col.rows.length === 0) throw new Error('The "users" table was not found. Check DB_NAME in your .env file.');
  const T = ID_TYPES[col.rows[0].data_type];
  if (!T) throw new Error(`Unsupported users.id type: ${col.rows[0].data_type}`);

  // community board
  await pool.query(`
    CREATE TABLE IF NOT EXISTS community_posts (
      id SERIAL PRIMARY KEY,
      user_id ${T} REFERENCES users(id) ON DELETE SET NULL,
      topic VARCHAR(40) NOT NULL, title VARCHAR(120) NOT NULL, body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS community_comments (
      id SERIAL PRIMARY KEY,
      post_id INTEGER NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
      user_id ${T} REFERENCES users(id) ON DELETE SET NULL,
      body TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );`);
  await pool.query('CREATE INDEX IF NOT EXISTS idx_posts_created ON community_posts (created_at DESC);');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_comments_post ON community_comments (post_id, created_at);');
  console.log('  OK  community discussion tables are ready');

  // chat (if a user deletes their account, their chat data is deleted too)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS chat_profiles (
      user_id ${T} PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      nickname VARCHAR(20) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );`);
  await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_nickname ON chat_profiles (LOWER(nickname));');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      room VARCHAR(30) NOT NULL,
      user_id ${T} NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      body VARCHAR(300) NOT NULL,
      hidden BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );`);
  await pool.query('CREATE INDEX IF NOT EXISTS idx_chat_room ON chat_messages (room, id DESC);');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_messages (user_id, created_at DESC);');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS chat_reports (
      message_id INTEGER NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
      reporter_id ${T} NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (message_id, reporter_id)
    );`);
  console.log('  OK  chat tables are ready');
}

function connectRoutes() {
  const file = path.join(__dirname, 'server.js');
  if (!fs.existsSync(file)) throw new Error('server.js not found. Run this from the "server" folder.');
  const original = fs.readFileSync(file, 'utf8');
  const eol = original.includes('\r\n') ? '\r\n' : '\n';
  const requireLine = /^.*require\(['"]\.\/routes\/auth['"]\);.*$/m;
  const useLine = /^.*app\.use\(['"]\/api\/auth['"].*$/m;
  if (!requireLine.test(original) || !useLine.test(original)) {
    throw new Error('Could not find the auth lines in server.js. Send me a screenshot of server.js.');
  }
  let text = original;
  const wanted = [
    { file: 'community', name: 'communityRoutes', url: '/api/community' },
    { file: 'chat', name: 'chatRoutes', url: '/api/chat' },
  ];
  let changed = false;
  for (const w of wanted) {
    if (text.includes(`routes/${w.file}`)) {
      console.log(`  OK  server.js already has /api/${w.file}`);
      continue;
    }
    text = text.replace(requireLine, (m) => `${m}${eol}const ${w.name} = require('./routes/${w.file}');`);
    text = text.replace(useLine, (m) => `${m}${eol}app.use('${w.url}', ${w.name});`);
    console.log(`  DONE server.js now serves ${w.url}`);
    changed = true;
  }
  if (changed) {
    if (!fs.existsSync(`${file}.chatbak`)) fs.writeFileSync(`${file}.chatbak`, original);
    fs.writeFileSync(file, text);
  }
}

createTables()
  .then(connectRoutes)
  .then(() => console.log('\nAll done. Restart the server (Ctrl + C, then: npm run dev).\n'))
  .catch((err) => {
    console.error('\nSetup failed:', err.message, '\n');
    process.exitCode = 1;
  })
  .finally(() => pool.end());
