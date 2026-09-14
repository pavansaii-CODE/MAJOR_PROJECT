const { generateHashFromBuffer, hashToBytes32, verifyHash } = require('../services/hashService');

describe('Certificate Hash Service', () => {
  test('Same content generates same hash', () => {
    const content = Buffer.from('test certificate content');
    const hash1 = generateHashFromBuffer(content);
    const hash2 = generateHashFromBuffer(content);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 = 64 hex chars
  });

  test('Different content generates different hash', () => {
    const content1 = Buffer.from('certificate 1');
    const content2 = Buffer.from('certificate 2');

    const hash1 = generateHashFromBuffer(content1);
    const hash2 = generateHashFromBuffer(content2);

    expect(hash1).not.toBe(hash2);
  });

  test('Hash to bytes32 conversion', () => {
    const hash = 'a'.repeat(64);
    const bytes32 = hashToBytes32(hash);

    expect(bytes32).toMatch(/^0x[a-f0-9]{64}$/);
    expect(bytes32).toBe(`0x${hash}`);
  });

  test('Verify hash correctly', () => {
    const content = Buffer.from('test content');
    const hash = generateHashFromBuffer(content);

    expect(verifyHash(content, hash)).toBe(true);
    expect(verifyHash(Buffer.from('different'), hash)).toBe(false);
  });
});
