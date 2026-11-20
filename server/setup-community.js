// setup-community.js
// Run ONCE from the server folder:   node setup-community.js
//
// 1. Creates the tables community_posts and community_comments (only if missing; never deletes data).
// 2. Connects the community API to your server.js by adding two lines (a backup is saved as
//    server.js.communitybak). If the lines are already there, it does nothing.

const fs = require('fs');
const path = require('path');
const pool = require('./db');

const ID_TYPES = { integer: 'INTEGER', bigint: 'BIGINT', smallint: 'SMALLINT', uuid: 'UUID' };

async function createTables() {
  const col = await pool.query(
    `SELECT data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id' LIMIT 1`,
  );
  if (col.rows.length === 0) throw new Error('The "users" table was not found. Check DB_NAME in your .env file.');
  const userIdType = ID_TYPES[col.rows[0].data_type];
  if (!userIdType) throw new Error(`Unsupported users.id type: ${col.rows[0].data_type}`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS community_posts (
      id          SERIAL PRIMARY KEY,
      user_id     ${userIdType} REFERENCES users(id) ON DELETE SET NULL,
      topic       VARCHAR(40)  NOT NULL,
      title       VARCHAR(120) NOT NULL,
      body        TEXT         NOT NULL,
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS community_comments (
      id          SERIAL PRIMARY KEY,
      post_id     INTEGER      NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
      user_id     ${userIdType} REFERENCES users(id) ON DELETE SET NULL,
      body        TEXT         NOT NULL,
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query('CREATE INDEX IF NOT EXISTS idx_posts_created ON community_posts (created_at DESC);');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_comments_post ON community_comments (post_id, created_at);');
  console.log('  OK  community tables are ready');
}

function connectRoutes() {
  const file = path.join(__dirname, 'server.js');
  if (!fs.existsSync(file)) throw new Error('server.js not found. Run this from the "server" folder.');
  const text = fs.readFileSync(file, 'utf8');
  if (text.includes('routes/community')) {
    console.log('  OK  server.js already connected');
    return;
  }
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const requireLine = /^.*require\(['"]\.\/routes\/auth['"]\);.*$/m;
  const useLine = /^.*app\.use\(['"]\/api\/auth['"].*$/m;
  if (!requireLine.test(text) || !useLine.test(text)) {
    throw new Error('Could not find the auth lines in server.js. Send me a screenshot of server.js.');
  }
  let out = text.replace(requireLine, (m) => `${m}${eol}const communityRoutes = require('./routes/community');`);
  out = out.replace(useLine, (m) => `${m}${eol}app.use('/api/community', communityRoutes);`);
  fs.writeFileSync(`${file}.communitybak`, text);
  fs.writeFileSync(file, out);
  console.log('  DONE server.js connected (backup: server.js.communitybak)');
}

createTables()
  .then(connectRoutes)
  .then(() => console.log('\nAll done. Restart the server (Ctrl + C, then: npm run dev).\n'))
  .catch((err) => {
    console.error('\nSetup failed:', err.message, '\n');
    process.exitCode = 1;
  })
  .finally(() => pool.end());
