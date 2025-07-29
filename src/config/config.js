require('dotenv').config();

const config = {
    // Bot Configuration
    BOT_TOKEN: process.env.BOT_TOKEN,
    USER_ID: process.env.USER_ID,
    
    // Dates
    GRADUATION_DATE: new Date('2025-11-21'),
    
    // Queensland school holidays 2024-2025
    QLD_HOLIDAYS: [
        { start: new Date('2024-12-16'), end: new Date('2025-01-27') }, // Summer holidays
        { start: new Date('2025-04-14'), end: new Date('2025-04-28') }, // Easter holidays
        { start: new Date('2025-07-07'), end: new Date('2025-07-21') }, // Winter holidays
        { start: new Date('2025-09-22'), end: new Date('2025-10-06') }, // Spring holidays
    ],
    
    // Milestone days to celebrate
    MILESTONES: [500, 365, 300, 250, 200, 150, 100, 75, 50, 30, 25, 20, 15, 10, 7, 5, 3, 2, 1],
    
    // Cron schedules
    CRON_SCHEDULES: {
        DAILY_MESSAGE: '0 6 * * *',
        MILESTONE_CHECK: '0 * * * *',
        REMINDER_CHECK: '* * * * *'
    },
    
    // Timezone
    TIMEZONE: 'Australia/Brisbane',
    
    // Colors
    COLORS: {
        PRIMARY: 0x00AE86,
        SUCCESS: 0x2ECC71,
        WARNING: 0xF39C12,
        ERROR: 0xE74C3C,
        INFO: 0x3498DB,
        MILESTONE: 0xFF6B6B,
        PURPLE: 0x9B59B6
    }
};

module.exports = config;
