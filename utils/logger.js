/**
 * Logger Utility
 * Centralized logging with multiple transports and levels
 */

const fs = require('fs');
const path = require('path');
const serverConfig = require('../config/server');

class Logger {
    constructor() {
        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3,
            trace: 4
        };
        
        this.colors = {
            error: '\x1b[31m', // Red
            warn: '\x1b[33m',  // Yellow
            info: '\x1b[36m',  // Cyan
            debug: '\x1b[35m', // Magenta
            trace: '\x1b[37m', // White
            reset: '\x1b[0m'
        };
        
        this.currentLevel = this.levels[serverConfig.LOG_LEVEL] || this.levels.info;
        this.logFile = serverConfig.LOG_FILE;
        
        // Ensure log directory exists
        this.ensureLogDirectory();
    }
    
    ensureLogDirectory() {
        const logDir = path.dirname(this.logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }
    
    formatMessage(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
    }
    
    writeToFile(formattedMessage) {
        try {
            fs.appendFileSync(this.logFile, formattedMessage + '\n');
        } catch (error) {
            console.error('Failed to write to log file:', error.message);
        }
    }
    
    log(level, message, meta = {}) {
        if (this.levels[level] > this.currentLevel) return;
        
        const formattedMessage = this.formatMessage(level, message, meta);
        
        // Console output with colors
        const color = this.colors[level] || this.colors.reset;
        console.log(`${color}${formattedMessage}${this.colors.reset}`);
        
        // File output
        if (serverConfig.NODE_ENV === 'production') {
            this.writeToFile(formattedMessage);
        }
    }
    
    error(message, meta = {}) {
        this.log('error', message, meta);
    }
    
    warn(message, meta = {}) {
        this.log('warn', message, meta);
    }
    
    info(message, meta = {}) {
        this.log('info', message, meta);
    }
    
    debug(message, meta = {}) {
        this.log('debug', message, meta);
    }
    
    trace(message, meta = {}) {
        this.log('trace', message, meta);
    }
    
    // Express middleware for request logging
    middleware() {
        return (req, res, next) => {
            const start = Date.now();
            
            res.on('finish', () => {
                const duration = Date.now() - start;
                const { method, url, ip } = req;
                const { statusCode } = res;
                
                this.info('HTTP Request', {
                    method,
                    url,
                    statusCode,
                    duration: `${duration}ms`,
                    ip: ip || 'unknown'
                });
            });
            
            next();
        };
    }
}

module.exports = new Logger();
