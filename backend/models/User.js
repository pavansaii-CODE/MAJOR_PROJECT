const { query, run, get } = require('../config/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class User {
  // Create new user
  static async create({ email, password, fullName, studentId }) {
    const id = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (id, email, password_hash, full_name, student_id)
      VALUES (?, ?, ?, ?, ?)
    `;

    await run(sql, [id, email, passwordHash, fullName, studentId || null]);
    return this.findById(id);
  }

  // Find user by ID
  static async findById(id) {
    const sql = 'SELECT * FROM users WHERE id = ?';
    return await get(sql, [id]);
  }

  // Find user by email
  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    return await get(sql, [email]);
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Get user's certificates
  static async getCertificates(userId) {
    const sql = `
      SELECT id, original_filename, file_hash, file_size, mime_type,
             ipfs_cid, ipfs_url, blockchain_tx_hash, blockchain_verified,
             verified_at, created_at
      FROM certificates
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;
    return await query(sql, [userId]);
  }
}

module.exports = User;
