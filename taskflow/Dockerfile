# ============================================
# MULTI-STAGE BUILD — React Frontend
#
# Stage 1 (builder): Install deps + build
# Stage 2 (production): Serve with nginx
#
# Multi-stage keeps the final image small!
# Builder stage is thrown away after build.
# ============================================

# Stage 1 — Build
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files first (layer caching)
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Stage 2 — Serve with nginx
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx config for React Router support
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]