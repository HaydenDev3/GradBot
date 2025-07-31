# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Create app user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S gradbot -u 1001

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY --chown=gradbot:nodejs . .

# Create logs directory
RUN mkdir -p logs && chown gradbot:nodejs logs

# Create public directory if it doesn't exist
RUN mkdir -p public && chown gradbot:nodejs public

# Switch to non-root user
USER gradbot

# Expose port
EXPOSE 27145

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').request({hostname:'localhost',port:27145,path:'/health',timeout:2000},res=>process.exit(res.statusCode===200?0:1)).on('error',()=>process.exit(1)).end()"

# Start application
CMD ["npm", "start"]
