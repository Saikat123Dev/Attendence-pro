/**
 * Server-Sent Events (SSE) Manager for real-time attendance updates
 *
 * This allows teachers to receive real-time notifications when students
 * mark their attendance, without needing to poll the server.
 */

class SSEManager {
  constructor() {
    // Map of sessionId -> Set of response objects
    this.clients = new Map();
  }

  /**
   * Add a client connection for a session
   * @param {string} sessionId - Attendance session ID
   * @param {object} res - Express response object
   */
  addClient(sessionId, res) {
    if (!this.clients.has(sessionId)) {
      this.clients.set(sessionId, new Set());
    }
    this.clients.get(sessionId).add(res);

    console.log(`SSE client connected for session ${sessionId}. Total: ${this.clients.get(sessionId).size}`);
  }

  /**
   * Remove a client connection
   * @param {string} sessionId - Attendance session ID
   * @param {object} res - Express response object
   */
  removeClient(sessionId, res) {
    if (this.clients.has(sessionId)) {
      this.clients.get(sessionId).delete(res);
      if (this.clients.get(sessionId).size === 0) {
        this.clients.delete(sessionId);
      }
    }
  }

  /**
   * Broadcast attendance marked event to all clients watching a session
   * @param {string} sessionId - Attendance session ID
   * @param {object} data - Event data
   */
  broadcast(sessionId, data) {
    if (!this.clients.has(sessionId)) {
      return;
    }

    const message = this.formatEvent('attendance-marked', data);
    const clients = this.clients.get(sessionId);

    clients.forEach((res) => {
      try {
        res.write(message);
      } catch (err) {
        // Client may have disconnected, remove it
        this.removeClient(sessionId, res);
      }
    });

    console.log(`SSE broadcast to session ${sessionId}:`, data);
  }

  /**
   * Broadcast session stopped event
   * @param {string} sessionId - Attendance session ID
   */
  broadcastSessionEnded(sessionId) {
    if (!this.clients.has(sessionId)) {
      return;
    }

    const message = this.formatEvent('session-ended', { sessionId });
    const clients = this.clients.get(sessionId);

    clients.forEach((res) => {
      try {
        res.write(message);
      } catch (err) {
        this.removeClient(sessionId, res);
      }
    });

    // Clean up after session ends
    this.clients.delete(sessionId);
  }

  /**
   * Format an SSE event
   * @param {string} event - Event type
   * @param {object} data - Event data
   * @returns {string} Formatted SSE message
   */
  formatEvent(event, data) {
    return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  }

  /**
   * Get number of active connections
   */
  getActiveConnections() {
    let total = 0;
    this.clients.forEach((clients) => {
      total += clients.size;
    });
    return total;
  }

  /**
   * Get number of sessions being watched
   */
  getWatchedSessions() {
    return this.clients.size;
  }
}

// Singleton instance
const sseManager = new SSEManager();

module.exports = sseManager;
