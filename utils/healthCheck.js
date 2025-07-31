/**
 * Health Check Service
 * Monitors application health and provides endpoints for monitoring
 */

const logger = require('../utils/logger');

class HealthCheck {
    constructor() {
        this.status = {
            app: 'unknown',
            bot: 'unknown',
            webServer: 'unknown',
            uptime: 0,
            memory: {},
            lastCheck: null
        };
        
        this.checks = new Map();
        this.startTime = Date.now();
        
        // Register default checks
        this.registerCheck('memory', this.checkMemory.bind(this));
        this.registerCheck('uptime', this.checkUptime.bind(this));
    }
    
    registerCheck(name, checkFunction) {
        this.checks.set(name, checkFunction);
    }
    
    async checkMemory() {
        const memUsage = process.memoryUsage();
        return {
            status: 'healthy',
            data: {
                rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
                heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
                heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
                external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
            }
        };
    }
    
    async checkUptime() {
        const uptime = Date.now() - this.startTime;
        return {
            status: 'healthy',
            data: {
                uptime: `${Math.round(uptime / 1000)}s`,
                started: new Date(this.startTime).toISOString()
            }
        };
    }
    
    async runChecks() {
        const results = {};
        let overallStatus = 'healthy';
        
        for (const [name, checkFn] of this.checks) {
            try {
                const result = await checkFn();
                results[name] = result;
                
                if (result.status !== 'healthy') {
                    overallStatus = 'unhealthy';
                }
            } catch (error) {
                logger.error(`Health check failed for ${name}`, { error: error.message });
                results[name] = {
                    status: 'error',
                    error: error.message
                };
                overallStatus = 'unhealthy';
            }
        }
        
        this.status = {
            ...this.status,
            overall: overallStatus,
            checks: results,
            lastCheck: new Date().toISOString()
        };
        
        return this.status;
    }
    
    setBotStatus(status) {
        this.status.bot = status;
        logger.debug('Bot status updated', { status });
    }
    
    setWebServerStatus(status) {
        this.status.webServer = status;
        logger.debug('Web server status updated', { status });
    }
    
    setAppStatus(status) {
        this.status.app = status;
        logger.debug('App status updated', { status });
    }
    
    getStatus() {
        return this.status;
    }
    
    // Express middleware for health endpoint
    middleware() {
        return async (req, res) => {
            try {
                const status = await this.runChecks();
                const httpStatus = status.overall === 'healthy' ? 200 : 503;
                
                res.status(httpStatus).json({
                    status: status.overall,
                    timestamp: new Date().toISOString(),
                    ...status
                });
            } catch (error) {
                logger.error('Health check endpoint error', { error: error.message });
                res.status(500).json({
                    status: 'error',
                    error: 'Health check failed'
                });
            }
        };
    }
}

module.exports = new HealthCheck();
