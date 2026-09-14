const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '..', 'database.sqlite');

let db;

// Get database connection
function getDatabase() {
  if (!db) {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        throw err;
      }
      console.log('✅ Connected to SQLite database');
    });
  }
  return db;
}

// Initialize database schema
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const db = getDatabase();

    db.serialize(() => {
      // Create users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          full_name TEXT NOT NULL,
          student_id TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating users table:', err);
          reject(err);
          return;
        }
        console.log('✅ Users table ready');
      });

      // Create certificates table
      db.run(`
        CREATE TABLE IF NOT EXISTS certificates (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          original_filename TEXT NOT NULL,
          file_hash TEXT UNIQUE NOT NULL,
          file_size INTEGER NOT NULL,
          mime_type TEXT NOT NULL,
          ipfs_cid TEXT,
          ipfs_url TEXT,
          is_encrypted INTEGER DEFAULT 0,
          blockchain_tx_hash TEXT,
          blockchain_verified INTEGER DEFAULT 0,
          verified_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.error('Error creating certificates table:', err);
          reject(err);
          return;
        }
        console.log('✅ Certificates table ready');

        // Add is_encrypted column if it doesn't exist (migration)
        db.run(`
          ALTER TABLE certificates ADD COLUMN is_encrypted INTEGER DEFAULT 0
        `, (err) => {
          if (err && !err.message.includes('duplicate column')) {
            console.error('Note: is_encrypted column may already exist');
          }
        });
      });

      // Create indexes
      db.run('CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_certificates_file_hash ON certificates(file_hash)');
      db.run('CREATE INDEX IF NOT EXISTS idx_certificates_blockchain_verified ON certificates(blockchain_verified)', (err) => {
        if (err) {
          console.error('Error creating indexes:', err);
          reject(err);
        } else {
          console.log('✅ Database indexes created');
          resolve();
        }
      });
    });
  });
}

// Query helper with promise support
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Run helper for INSERT/UPDATE/DELETE
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

// Get single row
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Close database connection
function closeDatabase() {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

module.exports = {
  getDatabase,
  initializeDatabase,
  query,
  run,
  get,
  closeDatabase
};
