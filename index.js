const GradBot = require('./src/GradBot');

// Load environment variables early
require('dotenv').config({ path: '/home/container/.env' });
console.log('🧪 Loaded ENV keys:', Object.keys(process.env));

// Entry Point
async function main() {
    console.log('\n🚀 Booting Graduation Bot stack...');
    
    // Pre-flight env check
    if (!process.env.BOT_TOKEN) {
        console.error('❌ BOT_TOKEN is undefined. Check your .env or container settings.');
        process.exit(1);
    }

    const bot = new GradBot();

    // Try to start Discord bot
    console.log('🎮 Launching Discord bot...');
    const started = await bot.start();

    if (started) {
        console.log('✅ Discord bot startup complete');
    } else {
        console.warn('⚠️ Discord bot failed to start. Proceeding with web server only.');
    }

    // Start web server
    try {
        require('./web-server');
        console.log('🌐 Web server successfully started');
    } catch (error) {
        console.error('❌ Failed to launch web server:', error.message);
    }

    // Keep process alive (optional fallback)
    setInterval(() => {}, 60000); // Comment this out if `client.login()` is confirmed to work

    // Global error handlers
    process.on('uncaughtException', (error) => {
        console.error('💥 Uncaught Exception:', error);
        process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
        console.error('💥 Unhandled Rejection:', reason);
        process.exit(1);
    });

    console.log('\n🧠 Startup flow complete. Monitoring runtime activity...');
}

// Run if file is executed directly
if (require.main === module) {
    main().catch((error) => {
        console.error('❌ Fatal error during startup:', error.message);
        process.exit(1);
    });
}

module.exports = { GradBot };
