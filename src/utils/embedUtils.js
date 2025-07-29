const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config/config');
const { calculateTimeUntilGraduation, getProgressData } = require('../utils/dateUtils');
const { getMilestoneMessage, getRandomMotivation, getInspirationalQuote } = require('../utils/messageUtils');

/**
 * Create daily countdown embed
 * @returns {EmbedBuilder} Daily countdown embed
 */
function createDailyEmbed() {
    const timeLeft = calculateTimeUntilGraduation();
    
    return new EmbedBuilder()
        .setTitle('🎓 Graduation Countdown 🎓')
        .setDescription('Here\'s your daily update on your journey to graduation!')
        .setColor(config.COLORS.PRIMARY)
        .addFields(
            { name: '📅 Total Days', value: `**${timeLeft.days}** days`, inline: true },
            { name: '📚 School Days', value: `**${timeLeft.schoolDays}** days`, inline: true },
            { name: '📝 Weeks', value: `**${timeLeft.weeks}** weeks`, inline: true },
            { name: '🗓️ Months', value: `**${timeLeft.months}** months`, inline: true },
            { name: '🎯 Target Date', value: 'November 21st, 2025', inline: true },
            { name: '💪 Progress', value: `You're getting closer every day!`, inline: true }
        )
        .setFooter({ text: 'Keep pushing forward! Your future awaits! ✨' })
        .setTimestamp();
}

/**
 * Create milestone celebration embed
 * @param {number} days - Number of days for milestone
 * @returns {EmbedBuilder} Milestone embed
 */
function createMilestoneEmbed(days) {
    return new EmbedBuilder()
        .setTitle('🎉 MILESTONE ALERT! 🎉')
        .setDescription(`**${days} DAYS LEFT UNTIL GRADUATION!**`)
        .setColor(config.COLORS.MILESTONE)
        .addFields(
            { name: '🎯 Achievement Unlocked!', value: `${days} days milestone reached!`, inline: false },
            { name: '💫 Motivation', value: getMilestoneMessage(days), inline: false },
            { name: '📅 Graduation Date', value: 'November 21st, 2025', inline: true },
            { name: '🔥 Keep Going!', value: 'You\'re amazing! 🌟', inline: true }
        )
        .setFooter({ text: 'Special milestone celebration! 🎊' })
        .setTimestamp();
}

/**
 * Create progress embed
 * @returns {EmbedBuilder} Progress embed
 */
function createProgressEmbed() {
    const progress = getProgressData();
    
    return new EmbedBuilder()
        .setTitle('📊 Your Progress')
        .setDescription(`Progress: ${progress.percentage}%\n\`${progress.bar}\`\n\nYou've conquered ${progress.completedDays} days already! 🎯`)
        .setColor(config.COLORS.INFO)
        .setTimestamp();
}

/**
 * Create motivation embed
 * @returns {EmbedBuilder} Motivation embed
 */
function createMotivationEmbed() {
    return new EmbedBuilder()
        .setTitle('💪 Daily Motivation')
        .setDescription(getRandomMotivation())
        .setColor(config.COLORS.SUCCESS)
        .setTimestamp();
}

/**
 * Create celebration embed
 * @returns {EmbedBuilder} Celebration embed
 */
function createCelebrationEmbed() {
    return new EmbedBuilder()
        .setTitle('🎉 Celebration Time!')
        .setDescription('You deserve to celebrate your progress! 🎊\n\nTake a moment to appreciate how far you\'ve come!\n\n🌟 You\'re doing amazing! 🌟')
        .setColor(config.COLORS.ERROR)
        .setTimestamp();
}

/**
 * Create statistics embed
 * @param {Array} userGoals - User goals array
 * @param {Array} studySessions - Study sessions array
 * @returns {EmbedBuilder} Statistics embed
 */
function createStatsEmbed(userGoals, studySessions) {
    const timeLeft = calculateTimeUntilGraduation();
    const totalStudyTime = studySessions.reduce((total, session) => total + session.duration, 0);
    const avgStudyTime = studySessions.length > 0 ? Math.round(totalStudyTime / studySessions.length) : 0;
    
    return new EmbedBuilder()
        .setTitle('📊 Graduation Statistics')
        .setColor(config.COLORS.PURPLE)
        .addFields(
            { name: '📅 Total Days Remaining', value: `${timeLeft.days}`, inline: true },
            { name: '📚 School Days Remaining', value: `${timeLeft.schoolDays}`, inline: true },
            { name: '🎯 Goals Completed', value: `${userGoals.filter(g => g.completed).length}/${userGoals.length}`, inline: true },
            { name: '📖 Study Sessions', value: `${studySessions.length}`, inline: true },
            { name: '⏱️ Total Study Time', value: `${Math.round(totalStudyTime / 60)}h ${totalStudyTime % 60}m`, inline: true },
            { name: '📈 Avg Session Length', value: `${avgStudyTime} minutes`, inline: true }
        )
        .setTimestamp();
}

/**
 * Create goals list embed
 * @param {Array} userGoals - User goals array
 * @returns {EmbedBuilder} Goals embed
 */
function createGoalsEmbed(userGoals) {
    if (userGoals.length === 0) {
        return new EmbedBuilder()
            .setTitle('🎯 Your Goals')
            .setDescription('📝 No goals set yet! Use `/goals add` to add your first goal.')
            .setColor(config.COLORS.WARNING);
    }
    
    const goalsList = userGoals.map(goal => 
        `${goal.completed ? '✅' : '⏳'} ${goal.text}`
    ).join('\n');
    
    return new EmbedBuilder()
        .setTitle('🎯 Your Goals')
        .setDescription(goalsList)
        .setColor(config.COLORS.ERROR)
        .setTimestamp();
}

/**
 * Create schedule embed
 * @param {Array} upcomingHolidays - Upcoming holidays array
 * @returns {EmbedBuilder} Schedule embed
 */
function createScheduleEmbed(upcomingHolidays) {
    const now = new Date();
    
    let scheduleText = '📅 **Upcoming Queensland School Holidays:**\n\n';
    if (upcomingHolidays.length > 0) {
        upcomingHolidays.forEach(holiday => {
            const startDate = holiday.start.toLocaleDateString();
            const endDate = holiday.end.toLocaleDateString();
            const daysUntil = Math.ceil((holiday.start - now) / (1000 * 3600 * 24));
            scheduleText += `🏖️ ${startDate} - ${endDate} (${daysUntil} days away)\n`;
        });
    } else {
        scheduleText += '🎉 No more holidays until graduation!';
    }
    
    return new EmbedBuilder()
        .setTitle('🗓️ School Schedule')
        .setDescription(scheduleText)
        .setColor(config.COLORS.INFO)
        .setTimestamp();
}

/**
 * Create quote embed
 * @returns {EmbedBuilder} Quote embed
 */
function createQuoteEmbed() {
    const quote = getInspirationalQuote();
    
    return new EmbedBuilder()
        .setTitle('💡 Daily Inspiration')
        .setDescription(`*"${quote}"*`)
        .setColor(config.COLORS.WARNING)
        .setTimestamp();
}

/**
 * Create study session embed
 * @param {number} duration - Study duration in minutes
 * @param {number} sessionNumber - Session number
 * @returns {EmbedBuilder} Study session embed
 */
function createStudySessionEmbed(duration, sessionNumber) {
    return new EmbedBuilder()
        .setTitle('📚 Study Session Started!')
        .setDescription(`Study timer set for **${duration} minutes**\n\nGood luck with your studies! 🍀`)
        .setColor(config.COLORS.SUCCESS)
        .addFields(
            { name: '⏰ Start Time', value: new Date().toLocaleTimeString(), inline: true },
            { name: '🏁 End Time', value: new Date(Date.now() + (duration * 60 * 1000)).toLocaleTimeString(), inline: true },
            { name: '📊 Session #', value: `${sessionNumber}`, inline: true }
        )
        .setTimestamp();
}

/**
 * Create study completion embed
 * @param {number} duration - Study duration in minutes
 * @returns {EmbedBuilder} Study completion embed
 */
function createStudyCompletionEmbed(duration) {
    return new EmbedBuilder()
        .setTitle('🎉 Study Session Complete!')
        .setDescription(`Your ${duration}-minute study session is finished!\n\nTime for a well-deserved break! 🌟`)
        .setColor(config.COLORS.SUCCESS)
        .setTimestamp();
}

/**
 * Create reminder embed
 * @param {string} message - Reminder message
 * @returns {EmbedBuilder} Reminder embed
 */
function createReminderEmbed(message) {
    return new EmbedBuilder()
        .setTitle('⏰ Reminder!')
        .setDescription(message)
        .setColor(config.COLORS.MILESTONE)
        .setTimestamp();
}

/**
 * Create next milestone embed
 * @param {Object} milestoneData - Milestone data object
 * @returns {EmbedBuilder} Next milestone embed
 */
function createNextMilestoneEmbed(milestoneData) {
    const description = milestoneData.milestone ? 
        `Your next milestone is **${milestoneData.milestone} days**!\nThat's in ${milestoneData.daysUntil} days.` :
        'You\'ve passed all major milestones! Graduation is almost here! 🎉';
    
    return new EmbedBuilder()
        .setTitle('🎯 Next Milestone')
        .setDescription(description)
        .setColor(config.COLORS.PRIMARY)
        .setTimestamp();
}

/**
 * Create button row for interactions
 * @returns {ActionRowBuilder} Button row
 */
function createButtonRow() {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('refresh_countdown')
                .setLabel('🔄 Refresh')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('motivation')
                .setLabel('💪 Motivate Me')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('progress')
                .setLabel('📊 Progress')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('celebration')
                .setLabel('🎉 Celebrate')
                .setStyle(ButtonStyle.Danger)
        );
}

module.exports = {
    createDailyEmbed,
    createMilestoneEmbed,
    createProgressEmbed,
    createMotivationEmbed,
    createCelebrationEmbed,
    createStatsEmbed,
    createGoalsEmbed,
    createScheduleEmbed,
    createQuoteEmbed,
    createStudySessionEmbed,
    createStudyCompletionEmbed,
    createReminderEmbed,
    createNextMilestoneEmbed,
    createButtonRow
};
