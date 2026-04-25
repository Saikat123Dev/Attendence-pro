const { generateHmac, generateNonce } = require('./crypto');
const config = require('../config');

/**
 * Generate a QR token for attendance session
 * Each token contains sessionId, timestamp, nonce, and HMAC signature
 * Tokens expire after config.qr.tokenExpiry milliseconds
 *
 * @param {string} sessionId - The attendance session ID
 * @returns {Object} Token object with data and signature
 */
function generateQRToken(sessionId) {
  const timestamp = Date.now();
  const nonce = generateNonce(4);

  const data = `${sessionId}:${timestamp}:${nonce}`;
  const signature = generateHmac(data);

  return {
    sessionId,
    timestamp,
    nonce,
    signature,
    data: JSON.stringify({ sessionId, timestamp, nonce, signature }),
  };
}

/**
 * Validate a QR token
 * @param {string} qrData - JSON string from QR code
 * @param {string} expectedSessionId - Expected session ID
 * @returns {Object} { valid: boolean, error?: string }
 */
function validateQRToken(qrData, expectedSessionId) {
  try {
    const token = JSON.parse(qrData);

    // 1. Verify signature
    const data = `${token.sessionId}:${token.timestamp}:${token.nonce}`;
    const expectedSignature = generateHmac(data);

    if (token.signature !== expectedSignature) {
      return { valid: false, error: 'INVALID_SIGNATURE' };
    }

    // 2. Check session ID match
    if (token.sessionId !== expectedSessionId) {
      return { valid: false, error: 'SESSION_MISMATCH' };
    }

    // 3. Check timestamp (2.5s grace period for network latency)
    const now = Date.now();
    const tokenAge = now - token.timestamp;

    if (tokenAge > config.qr.tokenExpiry + 500) {
      return { valid: false, error: 'TOKEN_EXPIRED' };
    }

    // 4. Check if token is not from the future (clock skew)
    if (token.timestamp > now + 1000) {
      return { valid: false, error: 'TOKEN_FUTURE' };
    }

    return { valid: true };
  } catch (err) {
    return { valid: false, error: 'INVALID_TOKEN_FORMAT' };
  }
}

module.exports = {
  generateQRToken,
  validateQRToken,
};
