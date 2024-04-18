const { Pool } = require('pg');

const pool = new Pool({
    user: 'airflow',
    host: 'localhost',
    database: 'airflow',
    password: 'airflow',
    port: 5435,
});

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
