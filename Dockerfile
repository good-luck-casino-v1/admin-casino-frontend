# -------------------------------
# 🏗️ Stage 1: Build CRA App
# -------------------------------
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install system dependencies for node-gyp
RUN apk add --no-cache python3 make g++

# Copy package files first (better Docker layer caching)
COPY package*.json ./

# Install dependencies - use npm install if lock file is out of sync
RUN npm ci --only=production --silent || npm install --only=production --silent

# Copy entire project
COPY . .

# Set production environment variables
ENV NODE_ENV=production
ENV REACT_APP_API_URL=https://admin.api.goodluck24bet.com

# Build the React application
RUN npm run build

# -------------------------------
# 🚀 Stage 2: Serve with Nginx
# -------------------------------
FROM nginx:stable-alpine

# Remove default nginx configurations
RUN rm -f /etc/nginx/conf.d/default.conf

# Create necessary directories with proper permissions for nginx user
RUN mkdir -p /var/cache/nginx/client_temp \
    /var/cache/nginx/proxy_temp \
    /var/cache/nginx/fastcgi_temp \
    /var/cache/nginx/uwsgi_temp \
    /var/cache/nginx/scgi_temp \
    /tmp/nginx \
    && chown -R nginx:nginx /var/cache/nginx /tmp/nginx \
    && chmod -R 755 /var/cache/nginx /tmp/nginx

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built React app from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Ensure nginx user owns the html directory
RUN chown -R nginx:nginx /usr/share/nginx/html

# Add metadata to the image
LABEL maintainer="Rajkumar Madhu"
LABEL version="1.0"
LABEL description="Admin Casino Frontend"

# Expose port
EXPOSE 8080

# Health check to verify nginx is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s \
  CMD wget -q -O /dev/null http://localhost:8080/health || exit 1

# Switch to non-root user for security
USER nginx

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
