# Frontend Dockerfile - Multi-stage build
# Stage 1: Build the React app
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Stage 2: Serve the app with nginx
FROM nginx:alpine

# Copy built app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx-custom.conf /etc/nginx/nginx.conf

# Create non-root user for security
RUN addgroup -g 1001 -S appuser || true
RUN adduser -S appuser -u 1001 -G appuser || true

# Change ownership of nginx directories
RUN chown -R appuser:appuser /var/cache/nginx && \
    chown -R appuser:appuser /var/log/nginx && \
    chown -R appuser:appuser /etc/nginx/conf.d && \
    chown -R appuser:appuser /usr/share/nginx/html

# Create nginx PID directory with proper permissions
RUN mkdir -p /tmp/nginx && \
    chown -R appuser:appuser /tmp/nginx

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start nginx with custom config
CMD ["nginx", "-g", "daemon off;"]