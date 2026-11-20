// setup-orders.js
// Run ONCE from the server folder:   node setup-orders.js
//
// Creates the two tables used for orders (orders, order_items) in your PostgreSQL database.
// Safe to run again: it only creates what is missing ("IF NOT EXISTS") and never deletes data.
//
// It reads the type of your existing users.id column (number or uuid) so the link between
// orders and users always matches your real table.

const pool = require('./db');

const ID_TYPES = { integer: 'INTEGER', bigint: 'BIGINT', smallint: 'SMALLINT', uuid: 'UUID' };

async function main() {
  const col = await pool.query(
    `SELECT data_type FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'id' LIMIT 1`,
  );
  if (col.rows.length === 0) {
    throw new Error('The "users" table was not found. Check DB_NAME in your .env file.');
  }
  const userIdType = ID_TYPES[col.rows[0].data_type];
  if (!userIdType) {
    throw new Error(`Unsupported users.id type: ${col.rows[0].data_type}`);
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id              SERIAL PRIMARY KEY,
      user_id         ${userIdType} NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status          VARCHAR(20)   NOT NULL DEFAULT 'placed',
      payment_method  VARCHAR(30)   NOT NULL,
      payment_status  VARCHAR(20)   NOT NULL DEFAULT 'pending',
      subtotal        NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
      shipping_name   VARCHAR(100)  NOT NULL,
      phone           VARCHAR(20)   NOT NULL,
      address_line1   VARCHAR(150)  NOT NULL,
      address_line2   VARCHAR(150)  NOT NULL DEFAULT '',
      city            VARCHAR(80)   NOT NULL,
      state           VARCHAR(80)   NOT NULL,
      postal_code     VARCHAR(10)   NOT NULL,
      country         VARCHAR(60)   NOT NULL DEFAULT 'India',
      notes           VARCHAR(300)  NOT NULL DEFAULT '',
      created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      CONSTRAINT orders_status_check CHECK (status IN ('placed','confirmed','shipped','delivered','cancelled')),
      CONSTRAINT orders_payment_status_check CHECK (payment_status IN ('pending','paid','refunded'))
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id          SERIAL PRIMARY KEY,
      order_id    INTEGER       NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      stamp_id    VARCHAR(30)   NOT NULL,
      name        VARCHAR(150)  NOT NULL,
      country     VARCHAR(80)   NOT NULL,
      year        INTEGER       NOT NULL,
      condition   VARCHAR(30)   NOT NULL,
      unit_price  NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
      quantity    INTEGER       NOT NULL CHECK (quantity BETWEEN 1 AND 10)
    );
  `);

  await pool.query('CREATE INDEX IF NOT EXISTS idx_orders_user ON orders (user_id, created_at DESC);');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id);');

  console.log('\nDone. The "orders" and "order_items" tables are ready.\n');
}

main()
  .catch((err) => {
    console.error('\nSetup failed:', err.message, '\n');
    process.exitCode = 1;
  })
  .finally(() => pool.end());
