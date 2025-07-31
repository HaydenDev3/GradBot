# GradBot - Production Deployment Guide

## 🚀 Quick Start

Your GradBot application has been revamped for production deployment with enhanced security, monitoring, and scalability features.

## 🏗️ Architecture Overview

```
├── index.js              # Main entry point with clustering support
├── config/
│   └── server.js         # Centralized configuration
├── server/
│   └── webServer.js      # Enhanced Express server
├── utils/
│   ├── logger.js         # Structured logging
│   └── healthCheck.js    # Health monitoring
├── logs/                 # Application logs
└── data/                 # Application data
```

## 🛠️ Setup & Installation

### 1. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit with your values
nano .env
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Development Mode

```bash
npm run dev
```

### 4. Production Mode

```bash
npm start
```

## 🐳 Docker Deployment

### Build and Run

```bash
# Build image
docker build -t gradbot .

# Run container
docker run -p 27145:27145 --env-file .env gradbot

# Or use Docker Compose
docker-compose up -d
```

## 🔧 Server Deployment

### Option 1: System Service (Recommended)

```bash
# Make deploy script executable
chmod +x deploy.sh

# Deploy to server
./deploy.sh production
```

### Option 2: PM2 Process Manager

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
npm run pm2:start

# Monitor
pm2 monit

# View logs
npm run pm2:logs
```

### Option 3: Manual systemd Service

```bash
# Create service file
sudo nano /etc/systemd/system/gradbot.service

# Reload and start
sudo systemctl daemon-reload
sudo systemctl enable gradbot
sudo systemctl start gradbot
```

## 📊 Monitoring & Health Checks

### Health Endpoints

- `GET /health` - Application health status
- `GET /api/health` - Detailed health information
- `GET /api/status` - Bot and server status

### Logs

```bash
# View real-time logs
npm run logs

# With PM2
pm2 logs gradbot

# With systemd
sudo journalctl -u gradbot -f
```

## 🔒 Security Features

- **Helmet.js** - Security headers
- **Rate limiting** - API protection
- **CORS** - Cross-origin protection
- **Session security** - Secure cookies
- **Input validation** - Request sanitization
- **Non-root user** - Docker security

## ⚡ Performance Features

- **Clustering** - Multi-process support
- **Compression** - Response compression
- **Static file optimization** - Efficient serving
- **Memory limits** - Resource management
- **Graceful shutdown** - Clean process termination

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `27145` |
| `HOST` | Server host | `0.0.0.0` |
| `LOG_LEVEL` | Logging level | `info` |
| `ENABLE_CLUSTERING` | Enable clustering | `false` |
| `CLUSTER_WORKERS` | Number of workers | `1` |

### Clustering

Enable clustering for better performance:

```bash
ENABLE_CLUSTERING=true CLUSTER_WORKERS=4 npm start
```

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   sudo lsof -i :27145
   sudo kill -9 <PID>
   ```

2. **Permission errors**
   ```bash
   sudo chown -R $USER:$USER /opt/gradbot
   ```

3. **Bot token issues**
   - Check `.env` file exists
   - Verify `BOT_TOKEN` is set
   - Ensure token has correct permissions

### Debug Mode

```bash
npm run dev:debug
```

### Logs Location

- Development: Console output
- Production: `./logs/app.log`
- PM2: `./logs/pm2-*.log`
- systemd: `journalctl -u gradbot`

## 🔄 Updates & Maintenance

### Updating the Application

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Restart service
sudo systemctl restart gradbot
# OR
pm2 restart gradbot
```

### Database Migrations (if applicable)

```bash
npm run migrate
```

## 📈 Scaling & Load Balancing

### Nginx Reverse Proxy

```nginx
upstream gradbot {
    server 127.0.0.1:27145;
}

server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://gradbot;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🛡️ Security Checklist

- [ ] Environment variables secured
- [ ] Admin passwords changed
- [ ] Rate limiting configured
- [ ] HTTPS enabled (in production)
- [ ] Firewall configured
- [ ] Regular security updates
- [ ] Log monitoring enabled

## 📞 Support

For issues and questions:
1. Check the logs first
2. Verify configuration
3. Test health endpoints
4. Check bot permissions in Discord

## 🎯 Next Steps

1. Set up monitoring (Prometheus/Grafana)
2. Configure log aggregation (ELK stack)
3. Set up automated backups
4. Implement CI/CD pipeline
5. Add database integration
6. Set up alerting

---

**Happy Deploying! 🚀**
