const { 
    createDailyEmbed, 
    createButtonRow, 
    createMotivationEmbed,
    createProgressEmbed,
    createCelebrationEmbed
} = require('../utils/embedUtils');

/**
 * Handle button interactions
 */
async function handleButtonInteraction(interaction) {
    const { customId } = interaction;

    switch (customId) {
        case 'refresh_countdown':
            await handleRefreshButton(interaction);
            break;

        case 'motivation':
            await handleMotivationButton(interaction);
            break;

        case 'progress':
            await handleProgressButton(interaction);
            break;

        case 'celebration':
            await handleCelebrationButton(interaction);
            break;

        default:
            await interaction.reply({ 
                content: 'Unknown button interaction!', 
                ephemeral: true 
            });
    }
}

/**
 * Handle refresh button
 */
async function handleRefreshButton(interaction) {
    const embed = createDailyEmbed();
    const buttons = createButtonRow();
    await interaction.update({ embeds: [embed], components: [buttons] });
}

/**
 * Handle motivation button
 */
async function handleMotivationButton(interaction) {
    const embed = createMotivationEmbed();
    await interaction.reply({ embeds: [embed], ephemeral: true });
}

/**
 * Handle progress button
 */
async function handleProgressButton(interaction) {
    const embed = createProgressEmbed();
    await interaction.reply({ embeds: [embed], ephemeral: true });
}

/**
 * Handle celebration button
 */
async function handleCelebrationButton(interaction) {
    const embed = createCelebrationEmbed();
    await interaction.reply({ embeds: [embed], ephemeral: true });
}

module.exports = {
    handleButtonInteraction
};
