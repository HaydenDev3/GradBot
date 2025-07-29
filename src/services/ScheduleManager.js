const cron = require('node-cron');
const config = require('../config/config');
const { createDailyEmbed, createMilestoneEmbed, createButtonRow, createReminderEmbed } = require('../utils/embedUtils');
const { calculateTimeUntilGraduation } = require('../utils/dateUtils');

/**
 * Schedule Manager - Handles all cron jobs and scheduled tasks
 */
class ScheduleManager {
    constructor(client, milestoneManager, reminderManager) {
        this.client = client;
        this.milestoneManager = milestoneManager;
        this.reminderManager = reminderManager;
        this.scheduledJobs = [];
    }

    /**
     * Initialize all scheduled tasks
     */
    initialize() {
        this.scheduleDailyMessage();
        this.scheduleMilestoneCheck();
        this.scheduleReminderCheck();
        console.log('✅ All scheduled tasks initialized');
    }

    /**
     * Schedule daily message at 6:00 AM
     */
    scheduleDailyMessage() {
        const job = cron.schedule(config.CRON_SCHEDULES.DAILY_MESSAGE, () => {
            console.log('📅 Sending daily graduation countdown...');
            this.sendDailyMessage();
            this.checkMilestones();
        }, {
            scheduled: true,
            timezone: config.TIMEZONE
        });

        this.scheduledJobs.push({ name: 'daily_message', job });
        console.log('📅 Daily message scheduler started');
    }

    /**
     * Schedule milestone checks every hour
     */
    scheduleMilestoneCheck() {
        const job = cron.schedule(config.CRON_SCHEDULES.MILESTONE_CHECK, () => {
            this.checkMilestones();
        });

        this.scheduledJobs.push({ name: 'milestone_check', job });
        console.log('🎯 Milestone checker started');
    }

    /**
     * Schedule reminder checks every minute
     */
    scheduleReminderCheck() {
        const job = cron.schedule(config.CRON_SCHEDULES.REMINDER_CHECK, async () => {
            await this.checkReminders();
        });

        this.scheduledJobs.push({ name: 'reminder_check', job });
        console.log('⏰ Reminder checker started');
    }

    /**
     * Send daily message
     */
    async sendDailyMessage() {
        try {
            const user = await this.client.users.fetch(config.USER_ID);
            const embed = createDailyEmbed();
            const buttons = createButtonRow();
            await user.send({ embeds: [embed], components: [buttons] });
            console.log('✅ Daily message sent successfully!');
        } catch (error) {
            console.error('❌ Error sending daily message:', error);
        }
    }

    /**
     * Check and send milestone messages
     */
    async checkMilestones() {
        const timeLeft = calculateTimeUntilGraduation();
        const milestonesToSend = this.milestoneManager.checkMilestones(timeLeft.days);
        
        for (const milestone of milestonesToSend) {
            try {
                const user = await this.client.users.fetch(config.USER_ID);
                const embed = createMilestoneEmbed(milestone);
                const buttons = createButtonRow();
                await user.send({ embeds: [embed], components: [buttons] });
                console.log(`🎉 Milestone message sent for ${milestone} days!`);
            } catch (error) {
                console.error(`❌ Error sending milestone message for ${milestone} days:`, error);
            }
        }
    }

    /**
     * Check and send due reminders
     */
    async checkReminders() {
        const dueReminders = this.reminderManager.getDueReminders();
        
        for (const reminder of dueReminders) {
            try {
                const user = await this.client.users.fetch(reminder.userId);
                const embed = createReminderEmbed(reminder.message);
                await user.send({ embeds: [embed] });
                
                this.reminderManager.markAsSent(reminder.id);
                console.log(`⏰ Reminder sent: ${reminder.message}`);
            } catch (error) {
                console.error('❌ Error sending reminder:', error);
            }
        }

        // Cleanup sent reminders periodically
        if (Math.random() < 0.1) { // 10% chance to cleanup
            this.reminderManager.cleanupSentReminders();
        }
    }

    /**
     * Stop all scheduled jobs
     */
    stopAll() {
        this.scheduledJobs.forEach(({ name, job }) => {
            job.stop();
            console.log(`🛑 Stopped scheduler: ${name}`);
        });
        this.scheduledJobs = [];
    }

    /**
     * Get status of all scheduled jobs
     */
    getStatus() {
        return this.scheduledJobs.map(({ name, job }) => ({
            name,
            running: job.running
        }));
    }
}

module.exports = ScheduleManager;
