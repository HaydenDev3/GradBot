/**
 * Enhanced Web Server
 * Production-ready Express server with security, monitoring, and best practices
 */

const express = require('express');
const path = require('path');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');

const serverConfig = require('../config/server');
const logger = require('../utils/logger');
const healthCheck = require('../utils/healthCheck');

function createWebServer(bot = null) {
    const app = express();
    
    // Security middleware
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
            },
        },
    }));
    
    // CORS
    app.use(cors({
        origin: serverConfig.CORS_ORIGIN,
        credentials: true
    }));
    
    // Compression
    app.use(compression());
    
    // Rate limiting
    const limiter = rateLimit({
        windowMs: serverConfig.RATE_LIMIT_WINDOW,
        max: serverConfig.RATE_LIMIT_MAX,
        message: {
            error: 'Too many requests from this IP, please try again later.'
        }
    });
    app.use('/api/', limiter);
    
    // Request logging
    app.use(logger.middleware());
    
    // Body parsing middleware
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    app.use(express.json({ limit: '10mb' }));
    
    // Static files
    app.use(express.static(serverConfig.STATIC_PATH));
    
    // Session management
    app.use(session({
        secret: serverConfig.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { 
            secure: serverConfig.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    }));
    
    // View engine
    app.set('view engine', 'ejs');
    app.set('views', serverConfig.VIEWS_PATH);
    
    // Trust proxy for production
    if (serverConfig.NODE_ENV === 'production') {
        app.set('trust proxy', 1);
    }
    
    // Routes
    setupRoutes(app, bot);
    
    // Error handling
    setupErrorHandling(app);
    
    return app;
}

function setupRoutes(app, bot) {
    // Health check endpoint
    app.get('/health', healthCheck.middleware());
    app.get('/api/health', healthCheck.middleware());
    
    // Status endpoint
    app.get('/api/status', (req, res) => {
        const status = healthCheck.getStatus();
        res.json({
            status: status.overall || 'unknown',
            bot: status.bot || 'unknown',
            webServer: status.webServer || 'unknown',
            uptime: process.uptime(),
            version: require('../package.json').version,
            environment: serverConfig.NODE_ENV
        });
    });
    
    // Admin credentials (move to config later)
    const ADMIN_CREDENTIALS = {
        'admin': process.env.ADMIN_PASSWORD || 'calliopeshs',
        'moderator': process.env.MOD_PASSWORD || 'graduation2025',
        'teacher': process.env.TEACHER_PASSWORD || 'schooldays'
    };
    
    // Authentication middleware
    function requireAuth(req, res, next) {
        if (req.session.authenticated) {
            next();
        } else {
            res.redirect('/login');
        }
    }
    
    // Main routes
    app.get('/', (req, res) => {
        if (req.session.authenticated) {
            res.redirect('/dashboard');
        } else {
            res.redirect('/login');
        }
    });
    
    app.get('/login', (req, res) => {
        res.render('login', { 
            error: null,
            environment: serverConfig.NODE_ENV 
        });
    });
    
    app.post('/login', (req, res) => {
        const { username, password } = req.body;
        
        if (ADMIN_CREDENTIALS[username] && ADMIN_CREDENTIALS[username] === password) {
            req.session.authenticated = true;
            req.session.username = username;
            logger.info('User authenticated', { username, ip: req.ip });
            res.redirect('/dashboard');
        } else {
            logger.warn('Failed login attempt', { username, ip: req.ip });
            res.render('login', { 
                error: 'Invalid credentials',
                environment: serverConfig.NODE_ENV 
            });
        }
    });
    
    app.get('/dashboard', requireAuth, (req, res) => {
        const dashboardData = {
            user: req.session.username,
            botStatus: bot ? (bot.client?.isReady() ? 'online' : 'offline') : 'not-connected',
            serverInfo: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                version: require('../package.json').version,
                environment: serverConfig.NODE_ENV
            }
        };
        
        res.render('dashboard', dashboardData);
    });
    
    app.post('/logout', requireAuth, (req, res) => {
        logger.info('User logged out', { username: req.session.username, ip: req.ip });
        req.session.destroy();
        res.redirect('/login');
    });
    
    // API Routes
    app.get('/api/bot/status', (req, res) => {
        if (!bot) {
            return res.json({ status: 'not-connected' });
        }
        
        res.json({
            status: bot.client?.isReady() ? 'online' : 'offline',
            uptime: bot.client?.uptime || 0,
            guilds: bot.client?.guilds?.cache?.size || 0,
            users: bot.client?.users?.cache?.size || 0
        });
    });
    
    // Catch-all route for API endpoints
    app.get('/api/*', (req, res) => {
        res.status(404).json({ error: 'API endpoint not found' });
    });
    
    // Catch-all route for web pages
    app.get('*', (req, res) => {
        res.status(404).json({ 
            error: 'Page not found',
            code: 404,
            message: 'The requested page does not exist'
        });
    });
}

function setupErrorHandling(app) {
    // 404 handler
    app.use((req, res) => {
        logger.warn('404 Not Found', { url: req.url, ip: req.ip });
        res.status(404).json({ error: 'Not Found' });
    });
    
    // Global error handler
    app.use((error, req, res, next) => {
        logger.error('Express error', { 
            error: error.message, 
            stack: error.stack,
            url: req.url,
            method: req.method,
            ip: req.ip
        });
        
        const isDev = serverConfig.NODE_ENV === 'development';
        
        res.status(error.status || 500).json({
            error: isDev ? error.message : 'Internal Server Error',
            ...(isDev && { stack: error.stack })
        });
    });
}

module.exports = createWebServer;
