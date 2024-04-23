const { Pool } = require('pg');

// const pool = new Pool({
//     user: 'default',
//     host: 'ep-steep-resonance-a4v94rfr-pooler.us-east-1.aws.neon.tech',
//     database: 'verceldb',
//     password: 'jfSIyqwR4K5E',
//     port: 5435,
// });
const pool = new Pool({
connectionString : "postgres://default:jfSIyqwR4K5E@ep-steep-resonance-a4v94rfr.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require"
   })

pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
});

async function createTable() {
  try {
    const client = await pool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    client.release();
    console.log("Tables created or already exist");
  } catch (err) {
    console.error("Error creating tables:", err);
  }
}
createTable();

module.exports = pool;
