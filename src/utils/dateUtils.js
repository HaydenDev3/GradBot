const config = require('../config/config');

/**
 * Calculate school days remaining until graduation
 * @param {Date} targetDate - The graduation date
 * @returns {number} Number of school days remaining
 */
function calculateSchoolDays(targetDate) {
    let current = new Date();
    let schoolDays = 0;
    
    while (current < targetDate) {
        const dayOfWeek = current.getDay();
        
        // Check if it's a weekday (Monday = 1, Friday = 5)
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            // Check if it's not a holiday
            const isHoliday = config.QLD_HOLIDAYS.some(holiday => 
                current >= holiday.start && current <= holiday.end
            );
            
            if (!isHoliday) {
                schoolDays++;
            }
        }
        
        current.setDate(current.getDate() + 1);
    }
    
    return schoolDays;
}

/**
 * Calculate time until graduation
 * @returns {Object} Object containing days, weeks, months, and school days
 */
function calculateTimeUntilGraduation() {
    const now = new Date();
    const timeDiff = config.GRADUATION_DATE.getTime() - now.getTime();
    
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const schoolDays = calculateSchoolDays(config.GRADUATION_DATE);
    
    return { days, weeks, months, schoolDays };
}

/**
 * Get progress percentage and visual bar
 * @returns {Object} Progress data with percentage and visual bar
 */
function getProgressData() {
    const timeLeft = calculateTimeUntilGraduation();
    const totalDays = Math.ceil((new Date('2025-11-21') - new Date('2024-01-01')) / (1000 * 3600 * 24));
    const progressPercent = Math.round(((totalDays - timeLeft.days) / totalDays) * 100);
    
    const progressBar = '█'.repeat(Math.floor(progressPercent / 5)) + '░'.repeat(20 - Math.floor(progressPercent / 5));
    
    return {
        percentage: progressPercent,
        bar: progressBar,
        completedDays: totalDays - timeLeft.days,
        totalDays
    };
}

/**
 * Get next milestone information
 * @param {number} currentDays - Current days remaining
 * @param {Set} sentMilestones - Set of already sent milestones
 * @returns {Object} Next milestone data
 */
function getNextMilestone(currentDays, sentMilestones) {
    const nextMilestone = config.MILESTONES.find(m => m < currentDays && !sentMilestones.has(m));
    
    return {
        milestone: nextMilestone,
        daysUntil: nextMilestone ? currentDays - nextMilestone : null
    };
}

/**
 * Check if a date is a school day
 * @param {Date} date - Date to check
 * @returns {boolean} True if it's a school day
 */
function isSchoolDay(date) {
    const dayOfWeek = date.getDay();
    
    // Not a weekday
    if (dayOfWeek === 0 || dayOfWeek === 6) return false;
    
    // Check if it's a holiday
    return !config.QLD_HOLIDAYS.some(holiday => 
        date >= holiday.start && date <= holiday.end
    );
}

/**
 * Get upcoming holidays
 * @returns {Array} Array of upcoming holidays
 */
function getUpcomingHolidays() {
    const now = new Date();
    return config.QLD_HOLIDAYS.filter(holiday => holiday.start > now);
}

module.exports = {
    calculateSchoolDays,
    calculateTimeUntilGraduation,
    getProgressData,
    getNextMilestone,
    isSchoolDay,
    getUpcomingHolidays
};
