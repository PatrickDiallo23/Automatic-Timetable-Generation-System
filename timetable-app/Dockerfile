# ─────────────────────────────────────────────────────────
# Stage 1: Install dependencies (cached independently of src)
# ─────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Copy lockfiles only → layer is cached until they change
COPY package.json package-lock.json ./
RUN npm ci

# ─────────────────────────────────────────────────────────
# Stage 2: Build Angular production bundle
# ─────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Re-use installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Production build with maximum optimisation
RUN npm run build -- --configuration production

# ─────────────────────────────────────────────────────────
# Stage 3: Production runtime — Nginx serving static files
# ─────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

# Remove default Nginx static files and config
RUN rm -rf /usr/share/nginx/html/* && \
    rm /etc/nginx/conf.d/default.conf

# Copy compiled Angular app
COPY --from=build /app/dist/timetable-app /usr/share/nginx/html

# Copy Nginx site configuration (provided at compose time via volume/COPY)
COPY nginx/app.conf /etc/nginx/conf.d/app.conf

# Non-root Nginx: Nginx master still needs root to bind port 80,
# but workers will run as 'nginx' user (UID 101) which is Alpine default.
# For extra hardening in production, expose 8080 and run fully non-root.

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
