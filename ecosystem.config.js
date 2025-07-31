// PM2 Configuration for Production Deployment
module.exports = {
  apps: [{
    name: 'gradbot',
    script: 'index.js',
    instances: 1, // or 'max' for clustering
    exec_mode: 'fork', // or 'cluster'
    
    // Environment
    env: {
      NODE_ENV: 'development',
      PORT: 27145
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 27145,
      ENABLE_CLUSTERING: false
    },
    
    // Restart policy
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Logging
    log_file: './logs/pm2-combined.log',
    out_file: './logs/pm2-out.log',
    error_file: './logs/pm2-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Advanced options
    kill_timeout: 5000,
    listen_timeout: 8000,
    
    // Health monitoring
    health_check_url: 'http://localhost:27145/health',
    health_check_grace_period: 10000
  }]
};
