const { query, run, get } = require('../config/database');
const crypto = require('crypto');

class Certificate {
  // Create new certificate record
  static async create({
    userId,
    originalFilename,
    fileHash,
    fileSize,
    mimeType,
    ipfsCid = null,
    ipfsUrl = null
  }) {
    const id = crypto.randomUUID();

    const sql = `
      INSERT INTO certificates (
        id, user_id, original_filename, file_hash, file_size, mime_type, ipfs_cid, ipfs_url
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await run(sql, [id, userId, originalFilename, fileHash, fileSize, mimeType, ipfsCid, ipfsUrl]);
    return this.findById(id);
  }

  // Update blockchain verification info
  static async updateBlockchainVerification(certificateId, txHash) {
    const sql = `
      UPDATE certificates
      SET blockchain_tx_hash = ?,
          blockchain_verified = 1,
          verified_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await run(sql, [txHash, certificateId]);
    return this.findById(certificateId);
  }

  // Find certificate by ID
  static async findById(id) {
    const sql = 'SELECT * FROM certificates WHERE id = ?';
    return await get(sql, [id]);
  }

  // Find certificate by hash
  static async findByHash(fileHash) {
    const sql = 'SELECT * FROM certificates WHERE file_hash = ?';
    return await get(sql, [fileHash]);
  }

  // Find certificate by IPFS CID
  static async findByIpfsCid(ipfsCid) {
    const sql = 'SELECT * FROM certificates WHERE ipfs_cid = ?';
    return await get(sql, [ipfsCid]);
  }

  // Get all certificates for a user
  static async findByUserId(userId) {
    const sql = `
      SELECT * FROM certificates
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;
    return await query(sql, [userId]);
  }

  // Get all verified certificates
  static async getVerified() {
    const sql = `
      SELECT c.*, u.full_name, u.student_id
      FROM certificates c
      JOIN users u ON c.user_id = u.id
      WHERE c.blockchain_verified = 1
      ORDER BY c.verified_at DESC
    `;
    return await query(sql, []);
  }

  // Check if hash exists
  static async hashExists(fileHash) {
    const sql = 'SELECT COUNT(*) as count FROM certificates WHERE file_hash = ?';
    const result = await get(sql, [fileHash]);
    return result.count > 0;
  }
}

module.exports = Certificate;
