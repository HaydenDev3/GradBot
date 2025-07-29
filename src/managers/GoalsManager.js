/**
 * Goals Manager - Handles all goal-related operations
 */
class GoalsManager {
    constructor() {
        this.goals = [];
    }

    /**
     * Add a new goal
     * @param {string} text - Goal description
     * @returns {Object} Created goal
     */
    addGoal(text) {
        const goal = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date()
        };
        this.goals.push(goal);
        return goal;
    }

    /**
     * Complete a goal
     * @param {string} searchText - Text to search for in goals
     * @returns {Object|null} Completed goal or null if not found
     */
    completeGoal(searchText) {
        const goal = this.goals.find(g => 
            g.text.toLowerCase().includes(searchText.toLowerCase()) && !g.completed
        );
        
        if (goal) {
            goal.completed = true;
            goal.completedAt = new Date();
        }
        
        return goal;
    }

    /**
     * Get all goals
     * @returns {Array} Array of all goals
     */
    getAllGoals() {
        return this.goals;
    }

    /**
     * Get completed goals count
     * @returns {number} Number of completed goals
     */
    getCompletedCount() {
        return this.goals.filter(g => g.completed).length;
    }

    /**
     * Get pending goals
     * @returns {Array} Array of pending goals
     */
    getPendingGoals() {
        return this.goals.filter(g => !g.completed);
    }
}

module.exports = GoalsManager;
