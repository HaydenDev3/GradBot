/**
 * Reminder Manager - Handles custom reminders
 */
class ReminderManager {
    constructor() {
        this.reminders = [];
    }

    /**
     * Add a new reminder
     * @param {string} message - Reminder message
     * @param {number} hours - Hours from now
     * @param {string} userId - User ID
     * @returns {Object} Created reminder
     */
    addReminder(message, hours, userId) {
        const reminder = {
            id: Date.now(),
            message: message,
            time: new Date(Date.now() + (hours * 60 * 60 * 1000)),
            userId: userId,
            sent: false,
            createdAt: new Date()
        };
        
        this.reminders.push(reminder);
        return reminder;
    }

    /**
     * Get due reminders
     * @returns {Array} Array of due reminders
     */
    getDueReminders() {
        const now = new Date();
        return this.reminders.filter(reminder => 
            reminder.time <= now && !reminder.sent
        );
    }

    /**
     * Mark reminder as sent
     * @param {number} reminderId - Reminder ID
     */
    markAsSent(reminderId) {
        const reminder = this.reminders.find(r => r.id === reminderId);
        if (reminder) {
            reminder.sent = true;
            reminder.sentAt = new Date();
        }
    }

    /**
     * Remove sent reminders (cleanup)
     */
    cleanupSentReminders() {
        this.reminders = this.reminders.filter(r => !r.sent);
    }

    /**
     * Get all active reminders
     * @returns {Array} Array of active reminders
     */
    getActiveReminders() {
        return this.reminders.filter(r => !r.sent);
    }

    /**
     * Get reminders count
     * @returns {number} Number of active reminders
     */
    getActiveCount() {
        return this.getActiveReminders().length;
    }
}

module.exports = ReminderManager;
