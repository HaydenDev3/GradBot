
const GradBot = require('./src/GradBot');

/**
 * Main entry point for the GradBot application
 */
async function main() {
    console.log('🎓 Starting Graduation Bot...');
    
    // Create and start the bot
    const bot = new GradBot();
    const started = await bot.start();
    
    if (started) {
        console.log('✅ Discord bot started successfully');
    } else {
        console.log('⚠️ Discord bot failed to start, continuing with web server...');
    }
    
    // Start web server independently
    try {
        require('./web-server');
        console.log('✅ Web server started successfully');
    } catch (error) {
        console.error('❌ Failed to start web server:', error);
    }
    
    // Graceful shutdown handling
    process.on('uncaughtException', (error) => {
        console.error('❌ Uncaught Exception:', error);
        process.exit(1);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
        console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
        process.exit(1);
    });
}

// Export for potential testing
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Failed to start application:', error);
        process.exit(1);
    });
}

module.exports = { GradBot };
