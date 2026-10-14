# Stage 1: Build the production React application
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies using clean install from lockfile
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source code and assets
COPY index.html vite.config.js ./
COPY src/ ./src/
COPY public/ ./public/

# Build static bundle
RUN npm run build

# Stage 2: Serve static files with NGINX
FROM nginx:alpine AS runtime

# Remove default NGINX configuration
RUN rm -rf /etc/nginx/conf.d/*

# Copy custom frontend NGINX configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy production static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
  CMD wget -q -O - http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
