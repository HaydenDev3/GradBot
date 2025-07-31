#!/bin/bash

# GradBot Deployment Script
# Usage: ./deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
APP_NAME="gradbot"
APP_DIR="/opt/gradbot"
SERVICE_NAME="gradbot"

echo "🚀 Starting deployment of GradBot to $ENVIRONMENT..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root. Consider using a non-root user for better security."
fi

# Check dependencies
print_status "Checking dependencies..."
command -v node >/dev/null 2>&1 || { print_error "Node.js is required but not installed. Aborting."; exit 1; }
command -v npm >/dev/null 2>&1 || { print_error "npm is required but not installed. Aborting."; exit 1; }

# Create application directory
print_status "Setting up application directory..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Stop existing service if running
print_status "Stopping existing service..."
if systemctl is-active --quiet $SERVICE_NAME; then
    sudo systemctl stop $SERVICE_NAME
    print_status "Service stopped"
else
    print_warning "Service was not running"
fi

# Backup current deployment
if [ -d "$APP_DIR/current" ]; then
    print_status "Creating backup..."
    sudo mv $APP_DIR/current $APP_DIR/backup-$(date +%Y%m%d-%H%M%S) || true
fi

# Copy new files
print_status "Deploying new version..."
cp -r . $APP_DIR/current/
cd $APP_DIR/current

# Install dependencies
print_status "Installing dependencies..."
npm ci --production

# Create logs directory
mkdir -p logs
mkdir -p data

# Set permissions
chmod +x index.js

# Create systemd service
print_status "Creating systemd service..."
sudo tee /etc/systemd/system/$SERVICE_NAME.service > /dev/null <<EOF
[Unit]
Description=GradBot Discord Bot
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR/current
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=$ENVIRONMENT
EnvironmentFile=$APP_DIR/current/.env

# Security
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$APP_DIR/current/logs $APP_DIR/current/data

# Resource limits
LimitNOFILE=65536
MemoryLimit=512M

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start service
print_status "Starting service..."
sudo systemctl daemon-reload
sudo systemctl enable $SERVICE_NAME
sudo systemctl start $SERVICE_NAME

# Wait for service to start
sleep 5

# Check service status
if systemctl is-active --quiet $SERVICE_NAME; then
    print_status "✅ Service is running successfully!"
    
    # Test health endpoint
    if command -v curl >/dev/null 2>&1; then
        print_status "Testing health endpoint..."
        if curl -f http://localhost:27145/health >/dev/null 2>&1; then
            print_status "✅ Health check passed!"
        else
            print_warning "Health check failed, but service is running"
        fi
    fi
else
    print_error "❌ Service failed to start"
    print_error "Check logs with: sudo journalctl -u $SERVICE_NAME -f"
    exit 1
fi

# Display status
print_status "Deployment Summary:"
echo "  Environment: $ENVIRONMENT"
echo "  Service: $SERVICE_NAME"
echo "  Directory: $APP_DIR/current"
echo "  Status: $(systemctl is-active $SERVICE_NAME)"
echo ""
echo "Useful commands:"
echo "  Check status: sudo systemctl status $SERVICE_NAME"
echo "  View logs: sudo journalctl -u $SERVICE_NAME -f"
echo "  Restart: sudo systemctl restart $SERVICE_NAME"
echo "  Stop: sudo systemctl stop $SERVICE_NAME"

print_status "🎉 Deployment completed successfully!"
