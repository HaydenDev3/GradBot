/**
 * Server Configuration
 * Centralized configuration for production deployment
 */

const path = require('path');

module.exports = {
    // Environment
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // Server Settings
    PORT: parseInt(process.env.PORT) || 27145,
    HOST: process.env.HOST || '0.0.0.0',
    
    // Security
    SESSION_SECRET: process.env.SESSION_SECRET || 'graduation-bot-secret-key-change-in-production',
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    
    // Database (if you add one later)
    DATABASE_URL: process.env.DATABASE_URL,
    
    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    LOG_FILE: process.env.LOG_FILE || path.join(__dirname, '../logs/app.log'),
    
    // Bot Configuration
    BOT_TOKEN: process.env.BOT_TOKEN,
    CLIENT_ID: process.env.CLIENT_ID,
    GUILD_ID: process.env.GUILD_ID,
    
    // Admin Configuration
    ADMIN_USERS: process.env.ADMIN_USERS ? process.env.ADMIN_USERS.split(',') : [],
    
    // Health Check
    HEALTH_CHECK_INTERVAL: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 60000,
    
    // Rate Limiting
    RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW) || 900000, // 15 minutes
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    
    // Performance
    CLUSTER_WORKERS: parseInt(process.env.CLUSTER_WORKERS) || 1,
    
    // Paths
    STATIC_PATH: path.join(__dirname, '../public'),
    VIEWS_PATH: path.join(__dirname, '../views'),
    LOGS_PATH: path.join(__dirname, '../logs'),
    
    // Features
    ENABLE_DASHBOARD: process.env.ENABLE_DASHBOARD !== 'false',
    ENABLE_METRICS: process.env.ENABLE_METRICS === 'true',
    ENABLE_CLUSTERING: process.env.ENABLE_CLUSTERING === 'true',
    
    // Validation
    validate() {
        const required = ['BOT_TOKEN'];
        const missing = required.filter(key => !process.env[key]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }
        
        return true;
    }
};
