/**
 * Study Session Manager - Handles all study session tracking
 */
class StudySessionManager {
    constructor() {
        this.sessions = [];
    }

    /**
     * Start a new study session
     * @param {number} duration - Duration in minutes
     * @param {string} userId - User ID
     * @returns {Object} Created study session
     */
    startSession(duration, userId) {
        const session = {
            id: Date.now(),
            duration: duration,
            startTime: new Date(),
            endTime: new Date(Date.now() + (duration * 60 * 1000)),
            userId: userId,
            completed: false
        };
        
        this.sessions.push(session);
        return session;
    }

    /**
     * Complete a study session
     * @param {number} sessionId - Session ID
     * @returns {Object|null} Completed session or null if not found
     */
    completeSession(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (session) {
            session.completed = true;
            session.actualEndTime = new Date();
        }
        return session;
    }

    /**
     * Get all sessions
     * @returns {Array} Array of all study sessions
     */
    getAllSessions() {
        return this.sessions;
    }

    /**
     * Get total study time in minutes
     * @returns {number} Total study time
     */
    getTotalStudyTime() {
        return this.sessions.reduce((total, session) => total + session.duration, 0);
    }

    /**
     * Get average session length
     * @returns {number} Average session length in minutes
     */
    getAverageSessionLength() {
        if (this.sessions.length === 0) return 0;
        return Math.round(this.getTotalStudyTime() / this.sessions.length);
    }

    /**
     * Get sessions count
     * @returns {number} Number of study sessions
     */
    getSessionsCount() {
        return this.sessions.length;
    }

    /**
     * Get completed sessions count
     * @returns {number} Number of completed sessions
     */
    getCompletedSessionsCount() {
        return this.sessions.filter(s => s.completed).length;
    }
}

module.exports = StudySessionManager;
