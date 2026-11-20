require('dotenv').config();
const { Pool } = require('pg');

// Two ways to connect:
//  1) Online hosting (Render, Neon, Supabase...): one DATABASE_URL setting, SSL on.
//  2) Your own computer: the separate DB_USER / DB_PASSWORD / DB_HOST / DB_PORT / DB_NAME
//     settings from .env, SSL off (unless you add DB_SSL=true).
const config = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
    }
  : {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool(config);

pool.on('connect', () => console.log('Connected to PostgreSQL'));

module.exports = pool;