# ---------- Build stage ----------
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies first so this layer is cached between builds
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build the production bundle
COPY . .
RUN npm run build

# ---------- Runtime stage ----------
FROM nginx:alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html

# SPA fallback: unknown paths serve index.html (client-side routing safe)
RUN printf 'server {\n\
    listen 80;\n\
    server_name _;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
\n\
    # Vite emits hashed filenames under /assets/ - cache them hard\n\
    location /assets/ {\n\
        expires 30d;\n\
        add_header Cache-Control "public, immutable";\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
