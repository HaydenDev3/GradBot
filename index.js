/**
 * GradBot - Production-Ready Entry Point
 * Enhanced for server deployment with proper error handling, logging, and monitoring
 */

const cluster = require('cluster');
const os = require('os');
const path = require('path');

// Load configuration first
require('dotenv').config({ path: path.join(__dirname, '.env') });

const serverConfig = require('./config/server');
const logger = require('./utils/logger');
const healthCheck = require('./utils/healthCheck');

// Validate configuration
try {
    serverConfig.validate();
    logger.info('Configuration validated successfully');
} catch (error) {
    logger.error('Configuration validation failed', { error: error.message });
    process.exit(1);
}

// Clustering support for production
if (serverConfig.ENABLE_CLUSTERING && cluster.isMaster) {
    const numWorkers = serverConfig.CLUSTER_WORKERS || os.cpus().length;
    
    logger.info(`Starting ${numWorkers} worker processes...`);
    
    // Fork workers
    for (let i = 0; i < numWorkers; i++) {
        cluster.fork();
    }
    
    // Handle worker events
    cluster.on('exit', (worker, code, signal) => {
        logger.warn(`Worker ${worker.process.pid} died`, { code, signal });
        logger.info('Starting a new worker...');
        cluster.fork();
    });
    
    cluster.on('online', (worker) => {
        logger.info(`Worker ${worker.process.pid} is online`);
    });
    
} else {
    // Worker process or single process mode
    startApplication();
}

async function startApplication() {
    logger.info('🚀 Starting GradBot Application...');
    
    try {
        healthCheck.setAppStatus('starting');
        
        // Import main application after config is loaded
        const GradBot = require('./src/GradBot');
        const createWebServer = require('./server/webServer');
        
        // Initialize bot
        logger.info('🎮 Initializing Discord bot...');
        const bot = new GradBot();
        
        // Start Discord bot
        const botStarted = await bot.start();
        if (botStarted) {
            logger.info('✅ Discord bot started successfully');
            healthCheck.setBotStatus('running');
        } else {
            logger.warn('⚠️ Discord bot failed to start. Continuing with web server only.');
            healthCheck.setBotStatus('failed');
        }
        
        // Start web server
        logger.info('🌐 Starting web server...');
        const app = await createWebServer(bot);
        
        const PORT = serverConfig.PORT;
        const HOST = serverConfig.HOST;
        
        const server = app.listen(PORT, HOST, () => {
            logger.info(`🌐 Web server running on http://${HOST}:${PORT}`);
            healthCheck.setWebServerStatus('running');
        });
        
        // Setup graceful shutdown
        setupGracefulShutdown(bot, server);
        
        // Setup health monitoring
        setupHealthMonitoring();
        
        healthCheck.setAppStatus('running');
        logger.info('✅ Application startup complete');
        
    } catch (error) {
        logger.error('❌ Failed to start application', { error: error.message, stack: error.stack });
        healthCheck.setAppStatus('failed');
        process.exit(1);
    }
}

function setupGracefulShutdown(bot, server) {
    const shutdown = async (signal) => {
        logger.info(`🛑 Received ${signal}. Starting graceful shutdown...`);
        healthCheck.setAppStatus('shutting-down');
        
        // Close web server
        if (server && typeof server.close === 'function') {
            try {
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Server close timeout'));
                    }, 10000); // 10 second timeout
                    
                    server.close((err) => {
                        clearTimeout(timeout);
                        if (err) reject(err);
                        else resolve();
                    });
                });
                logger.info('🌐 Web server closed');
                healthCheck.setWebServerStatus('stopped');
            } catch (error) {
                logger.error('❌ Error closing web server', { error: error.message });
                healthCheck.setWebServerStatus('error');
            }
        } else {
            logger.warn('⚠️ No valid server to close or server.close is not a function');
        }
        
        // Stop Discord bot
        if (bot && bot.client) {
            try {
                await bot.shutdown();
                logger.info('🎮 Discord bot stopped');
                healthCheck.setBotStatus('stopped');
            } catch (error) {
                logger.error('❌ Error stopping Discord bot', { error: error.message });
                healthCheck.setBotStatus('error');
            }
        }
        
        logger.info('✅ Graceful shutdown complete');
        process.exit(0);
    };
    
    // Handle shutdown signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
        logger.error('💥 Uncaught Exception', { error: error.message, stack: error.stack });
        healthCheck.setAppStatus('error');
        process.exit(1);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
        logger.error('💥 Unhandled Promise Rejection', { 
            reason: reason?.message || reason,
            stack: reason?.stack 
        });
        healthCheck.setAppStatus('error');
        process.exit(1);
    });
}

function setupHealthMonitoring() {
    // Periodic health checks
    setInterval(async () => {
        try {
            await healthCheck.runChecks();
            logger.debug('Health check completed');
        } catch (error) {
            logger.error('Health check failed', { error: error.message });
        }
    }, serverConfig.HEALTH_CHECK_INTERVAL);
    
    logger.info('🏥 Health monitoring enabled');
}

// Export for testing
module.exports = { 
    startApplication,
    setupGracefulShutdown,
    setupHealthMonitoring
};
