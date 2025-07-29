const { 
    createDailyEmbed, 
    createButtonRow, 
    createNextMilestoneEmbed,
    createStatsEmbed,
    createGoalsEmbed,
    createScheduleEmbed,
    createQuoteEmbed,
    createStudySessionEmbed,
    createStudyCompletionEmbed,
    createReminderEmbed
} = require('../utils/embedUtils');
const { calculateTimeUntilGraduation, getUpcomingHolidays } = require('../utils/dateUtils');
const config = require('../config/config');

/**
 * Handle slash command interactions
 */
async function handleSlashCommand(interaction, goalsManager, studyManager, reminderManager, milestoneManager) {
    const { commandName } = interaction;

    switch (commandName) {
        case 'countdown':
            await handleCountdownCommand(interaction);
            break;

        case 'milestone':
            await handleMilestoneCommand(interaction, milestoneManager);
            break;

        case 'stats':
            await handleStatsCommand(interaction, goalsManager, studyManager);
            break;

        case 'goals':
            await handleGoalsCommand(interaction, goalsManager);
            break;

        case 'schedule':
            await handleScheduleCommand(interaction);
            break;

        case 'quote':
            await handleQuoteCommand(interaction);
            break;

        case 'reminder':
            await handleReminderCommand(interaction, reminderManager);
            break;

        case 'study':
            await handleStudyCommand(interaction, studyManager);
            break;

        default:
            await interaction.reply({ 
                content: 'Unknown command!', 
                ephemeral: true 
            });
    }
}

/**
 * Handle countdown command
 */
async function handleCountdownCommand(interaction) {
    const embed = createDailyEmbed();
    const buttons = createButtonRow();
    await interaction.reply({ embeds: [embed], components: [buttons] });
}

/**
 * Handle milestone command
 */
async function handleMilestoneCommand(interaction, milestoneManager) {
    const timeLeft = calculateTimeUntilGraduation();
    const nextMilestone = milestoneManager.getNextMilestone(timeLeft.days);
    
    const embed = createNextMilestoneEmbed(nextMilestone);
    const buttons = createButtonRow();
    await interaction.reply({ embeds: [embed], components: [buttons] });
}

/**
 * Handle stats command
 */
async function handleStatsCommand(interaction, goalsManager, studyManager) {
    const embed = createStatsEmbed(goalsManager.getAllGoals(), studyManager.getAllSessions());
    await interaction.reply({ embeds: [embed] });
}

/**
 * Handle goals command
 */
async function handleGoalsCommand(interaction, goalsManager) {
    const action = interaction.options.getString('action');
    const goalText = interaction.options.getString('goal');
    
    switch (action) {
        case 'add':
            if (!goalText) {
                await interaction.reply({ 
                    content: '❌ Please provide a goal description.', 
                    ephemeral: true 
                });
                return;
            }
            goalsManager.addGoal(goalText);
            await interaction.reply({ 
                content: `✅ Goal added: "${goalText}"`, 
                ephemeral: true 
            });
            break;

        case 'list':
            const embed = createGoalsEmbed(goalsManager.getAllGoals());
            await interaction.reply({ embeds: [embed] });
            break;

        case 'complete':
            if (!goalText) {
                await interaction.reply({ 
                    content: '❌ Please provide part of the goal text to complete.', 
                    ephemeral: true 
                });
                return;
            }
            const completedGoal = goalsManager.completeGoal(goalText);
            if (completedGoal) {
                await interaction.reply({ 
                    content: `🎉 Congratulations! Goal completed: "${completedGoal.text}"`, 
                    ephemeral: true 
                });
            } else {
                await interaction.reply({ 
                    content: '❌ Goal not found or already completed.', 
                    ephemeral: true 
                });
            }
            break;
    }
}

/**
 * Handle schedule command
 */
async function handleScheduleCommand(interaction) {
    const upcomingHolidays = getUpcomingHolidays();
    const embed = createScheduleEmbed(upcomingHolidays);
    await interaction.reply({ embeds: [embed] });
}

/**
 * Handle quote command
 */
async function handleQuoteCommand(interaction) {
    const embed = createQuoteEmbed();
    await interaction.reply({ embeds: [embed] });
}

/**
 * Handle reminder command
 */
async function handleReminderCommand(interaction, reminderManager) {
    const message = interaction.options.getString('message');
    const hours = interaction.options.getInteger('hours');
    
    const reminder = reminderManager.addReminder(message, hours, interaction.user.id);
    const reminderTime = reminder.time.toLocaleTimeString();
    
    await interaction.reply({ 
        content: `⏰ Reminder set! I'll remind you "${message}" in ${hours} hour(s) at ${reminderTime}.`, 
        ephemeral: true 
    });
}

/**
 * Handle study command
 */
async function handleStudyCommand(interaction, studyManager) {
    const duration = interaction.options.getInteger('duration') || 25; // Default 25 minutes (Pomodoro)
    
    const session = studyManager.startSession(duration, interaction.user.id);
    const embed = createStudySessionEmbed(duration, studyManager.getSessionsCount());
    
    await interaction.reply({ embeds: [embed] });
    
    // Set timer for study session completion
    setTimeout(async () => {
        try {
            studyManager.completeSession(session.id);
            const user = await interaction.client.users.fetch(interaction.user.id);
            const completionEmbed = createStudyCompletionEmbed(duration);
            await user.send({ embeds: [completionEmbed] });
        } catch (error) {
            console.error('Error sending study completion message:', error);
        }
    }, duration * 60 * 1000);
}

module.exports = {
    handleSlashCommand
};
