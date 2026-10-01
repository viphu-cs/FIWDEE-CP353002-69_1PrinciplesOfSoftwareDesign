# Multi-stage build for React + Vite Frontend

# ===================================================================
# Stage 1: Build stage using Node 20
# ===================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies (clean install)
RUN npm ci

# Copy frontend source files
COPY . .

# Build production assets
RUN npm run build

# ===================================================================
# Stage 2: Serve stage using Nginx Alpine
# ===================================================================
FROM nginx:1.27-alpine AS runner

# Remove default nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
