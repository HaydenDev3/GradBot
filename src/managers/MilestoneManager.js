/**
 * Milestone Manager - Handles milestone tracking and notifications
 */
class MilestoneManager {
    constructor(milestones) {
        this.milestones = milestones;
        this.sentMilestones = new Set();
    }

    /**
     * Check if a milestone should be sent
     * @param {number} daysLeft - Current days left
     * @returns {Array} Array of milestones to send
     */
    checkMilestones(daysLeft) {
        const milestonesToSend = [];
        
        for (const milestone of this.milestones) {
            if (daysLeft === milestone && !this.sentMilestones.has(milestone)) {
                milestonesToSend.push(milestone);
                this.sentMilestones.add(milestone);
            }
        }
        
        return milestonesToSend;
    }

    /**
     * Get next milestone
     * @param {number} daysLeft - Current days left
     * @returns {Object} Next milestone info
     */
    getNextMilestone(daysLeft) {
        const nextMilestone = this.milestones.find(m => m < daysLeft && !this.sentMilestones.has(m));
        
        return {
            milestone: nextMilestone,
            daysUntil: nextMilestone ? daysLeft - nextMilestone : null
        };
    }

    /**
     * Get sent milestones
     * @returns {Set} Set of sent milestones
     */
    getSentMilestones() {
        return this.sentMilestones;
    }

    /**
     * Reset milestone tracking (for testing)
     */
    reset() {
        this.sentMilestones.clear();
    }

    /**
     * Get progress towards next milestone
     * @param {number} daysLeft - Current days left
     * @returns {Object} Progress info
     */
    getMilestoneProgress(daysLeft) {
        const nextMilestone = this.getNextMilestone(daysLeft);
        const lastMilestone = this.milestones.find(m => m > daysLeft);
        
        if (!nextMilestone.milestone || !lastMilestone) {
            return null;
        }
        
        const totalRange = lastMilestone - nextMilestone.milestone;
        const currentProgress = lastMilestone - daysLeft;
        const progressPercent = Math.round((currentProgress / totalRange) * 100);
        
        return {
            nextMilestone: nextMilestone.milestone,
            lastMilestone: lastMilestone,
            daysUntilNext: nextMilestone.daysUntil,
            progressPercent: progressPercent
        };
    }
}

module.exports = MilestoneManager;
