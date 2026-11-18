# syntax=docker/dockerfile:1

# ---------- 1. Build the static app ----------
FROM node:22-alpine AS build
WORKDIR /src

# Install dependencies first (cached as long as the lockfile does not change)
COPY package.json package-lock.json ./
COPY app/package.json app/
RUN npm ci --no-audit --no-fund

COPY app app
# The image serves the app from the root path; GitHub Pages builds use a sub-path instead.
ARG VITE_BASE=/
ARG APP_VERSION=dev
ARG GIT_SHA=unknown
RUN VITE_BASE=$VITE_BASE npm run build \
 && printf '{"version":"%s","commit":"%s"}\n' "$APP_VERSION" "$GIT_SHA" > app/dist/version.json

# ---------- 2. Serve it with nginx ----------
FROM nginx:1.27-alpine

ARG APP_VERSION=dev
ARG GIT_SHA=unknown
LABEL org.opencontainers.image.title="qa-playground" \
      org.opencontainers.image.description="Multi-market demo web shop built as a target for test automation" \
      org.opencontainers.image.version="$APP_VERSION" \
      org.opencontainers.image.revision="$GIT_SHA" \
      org.opencontainers.image.licenses="MIT"

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/app/dist /usr/share/nginx/html

EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
