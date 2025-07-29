/**
 * Get motivational message for milestones
 * @param {number} days - Number of days for the milestone
 * @returns {string} Motivational message
 */
function getMilestoneMessage(days) {
    const messages = {
        500: "Wow! 500 days to go! The journey has begun! 🚀",
        365: "1 year left! Time to make it count! 📚✨",
        300: "300 days! You're in the final stretch! 💪",
        250: "250 days! Can you feel the excitement building? 🎯",
        200: "200 days! The finish line is getting closer! 🏁",
        150: "150 days! Time to sprint towards your dreams! 🌟",
        100: "TRIPLE DIGITS! 100 days to graduation! 🎊",
        75: "75 days! You can almost taste the freedom! 🎓",
        50: "50 days! Less than 2 months to go! 🔥",
        30: "30 days! ONE MONTH LEFT! 🚀",
        25: "25 days! Christmas countdown vibes! 🎄",
        20: "20 days! You're so close now! 💫",
        15: "15 days! Two weeks to freedom! ⚡",
        10: "10 DAYS! SINGLE DIGITS! 🎉",
        7: "ONE WEEK LEFT! 7 DAYS! 🌟",
        5: "5 DAYS! FINAL COUNTDOWN! 🚀",
        3: "3 DAYS! SO CLOSE! 💥",
        2: "2 DAYS! TOMORROW'S TOMORROW! ⚡",
        1: "TOMORROW IS THE DAY! 24 HOURS! 🎊"
    };
    
    return messages[days] || `${days} days left! Keep pushing! 💪`;
}

/**
 * Get random motivation quote
 * @returns {string} Random motivational quote
 */
function getRandomMotivation() {
    const quotes = [
        "You're closer than you think! 💪",
        "Every day is progress! 🌟",
        "Your future self will thank you! ✨",
        "Champions finish what they start! 🏆",
        "The struggle will be worth it! 💎",
        "You've got this! Keep pushing! 🚀",
        "Success is just around the corner! 🎯",
        "Your dreams are calling! 📞",
        "Excellence is a habit! 🔥",
        "Believe in yourself! You're amazing! 🌈"
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
}

/**
 * Get inspirational quotes
 * @returns {string} Random inspirational quote
 */
function getInspirationalQuote() {
    const quotes = [
        "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
        "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
        "The only way to do great work is to love what you do. - Steve Jobs",
        "Education is the most powerful weapon which you can use to change the world. - Nelson Mandela",
        "Your limitation—it's only your imagination.",
        "Push yourself, because no one else is going to do it for you.",
        "Sometimes later becomes never. Do it now.",
        "Great things never come from comfort zones.",
        "Don't stop when you're tired. Stop when you're done.",
        "Wake up with determination. Go to bed with satisfaction."
    ];
    
    return quotes[Math.floor(Math.random() * quotes.length)];
}

module.exports = {
    getMilestoneMessage,
    getRandomMotivation,
    getInspirationalQuote
};
