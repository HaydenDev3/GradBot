const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config/config');
const commands = require('./commands/commands');
const { handleSlashCommand } = require('./handlers/slashCommandHandler');
const { handleButtonInteraction } = require('./handlers/buttonHandler');
const ScheduleManager = require('./services/ScheduleManager');
const GoalsManager = require('./managers/GoalsManager');
const StudySessionManager = require('./managers/StudySessionManager');
const ReminderManager = require('./managers/ReminderManager');
const MilestoneManager = require('./managers/MilestoneManager');
const { calculateTimeUntilGraduation } = require('./utils/dateUtils');

/**
 * GradBot - Main application class
 */
class GradBot {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.DirectMessageReactions
            ]
        });

        // Initialize managers
        this.goalsManager = new GoalsManager();
        this.studyManager = new StudySessionManager();
        this.reminderManager = new ReminderManager();
        this.milestoneManager = new MilestoneManager(config.MILESTONES);
        this.scheduleManager = new ScheduleManager(
            this.client, 
            this.milestoneManager, 
            this.reminderManager
        );

        this.setupEventHandlers();
    }

    /**
     * Setup Discord event handlers
     */
    setupEventHandlers() {
        this.client.once('ready', () => this.onReady());
        this.client.on('interactionCreate', (interaction) => this.onInteraction(interaction));
        
        // Handle process termination gracefully
        process.on('SIGTERM', () => this.shutdown());
        process.on('SIGINT', () => this.shutdown());
    }

    /**
     * Handle bot ready event
     */
    async onReady() {
        console.log(`🎓 Graduation Bot is online! Logged in as ${this.client.user.tag}`);
        console.log(`📅 Tracking graduation date: ${config.GRADUATION_DATE.toDateString()}`);
        
        await this.registerCommands();
        this.scheduleManager.initialize();
        
        const timeLeft = calculateTimeUntilGraduation();
        console.log(`⏰ Days until graduation: ${timeLeft.days}`);
        console.log(`📚 School days until graduation: ${timeLeft.schoolDays}`);
        
        console.log('🚀 Bot fully initialized and ready!');
    }

    /**
     * Register slash commands
     */
    async registerCommands() {
        try {
            await this.client.application.commands.set(commands);
            console.log('✅ Slash commands registered successfully');
        } catch (error) {
            console.error('❌ Error registering commands:', error);
        }
    }

    /**
     * Handle interaction events
     */
    async onInteraction(interaction) {
        // Only respond to the configured user
        if (interaction.user.id !== config.USER_ID) {
            await interaction.reply({ 
                content: 'This bot is configured for a specific user only.', 
                ephemeral: true 
            });
            return;
        }

        try {
            if (interaction.isButton()) {
                await handleButtonInteraction(interaction);
            } else if (interaction.isChatInputCommand()) {
                await handleSlashCommand(
                    interaction, 
                    this.goalsManager, 
                    this.studyManager, 
                    this.reminderManager, 
                    this.milestoneManager
                );
            }
        } catch (error) {
            console.error('❌ Error handling interaction:', error);
            
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ 
                    content: 'An error occurred while processing your request.', 
                    ephemeral: true 
                });
            }
        }
    }

    /**
     * Start the bot
     */
    async start() {
        console.log('🔐 BOT_TOKEN length:', (config.BOT_TOKEN || '').length);

        if (!config.BOT_TOKEN) {
            console.error('❌ No bot token provided. Discord bot will not start.');
            return false;
        }

        try {
            await this.client.login(config.BOT_TOKEN);
            return true;
        } catch (error) {
            console.error('❌ Failed to start Discord bot:', error.message);
            return false;
        }
    }

    /**
     * Shutdown the bot gracefully
     */
    async shutdown() {
        console.log('🛑 Graduation Bot shutting down...');
        
        this.scheduleManager.stopAll();
        await this.client.destroy();
        
        console.log('✅ Bot shutdown complete');
        process.exit(0);
    }

    /**
     * Get bot statistics
     */
    getStats() {
        const timeLeft = calculateTimeUntilGraduation();
        
        return {
            uptime: process.uptime(),
            daysUntilGraduation: timeLeft.days,
            schoolDaysUntilGraduation: timeLeft.schoolDays,
            totalGoals: this.goalsManager.getAllGoals().length,
            completedGoals: this.goalsManager.getCompletedCount(),
            studySessions: this.studyManager.getSessionsCount(),
            totalStudyTime: this.studyManager.getTotalStudyTime(),
            activeReminders: this.reminderManager.getActiveCount(),
            schedulerStatus: this.scheduleManager.getStatus()
        };
    }
}

module.exports = GradBot;
