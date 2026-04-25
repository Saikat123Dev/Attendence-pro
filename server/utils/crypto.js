const crypto = require('crypto');
const config = require('../config');

/**
 * Generate HMAC-SHA256 signature
 * @param {string} data - Data to sign
 * @returns {string} Hex-encoded signature
 */
function generateHmac(data) {
  return crypto
    .createHmac('sha256', config.qr.secret)
    .update(data)
    .digest('hex');
}

/**
 * Verify HMAC signature
 * @param {string} data - Original data
 * @param {string} signature - Signature to verify
 * @returns {boolean}
 */
function verifyHmac(data, signature) {
  const expected = generateHmac(data);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

/**
 * Generate cryptographically secure random string
 * @param {number} bytes - Number of bytes
 * @returns {string} Hex-encoded string
 */
function generateNonce(bytes = 4) {
  return crypto.randomBytes(bytes).toString('hex');
}

module.exports = {
  generateHmac,
  verifyHmac,
  generateNonce,
};
