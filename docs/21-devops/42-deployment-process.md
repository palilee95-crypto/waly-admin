# 42 — Admin Portal: Deployment Process

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

The Admin Portal is deployed as a static SPA (Vite production build) served by Caddy. It shares the same server as the existing `web-app` PocketBase backend, proxied behind Caddy.

---

## 2. Server Architecture

```
Internet → Caddy (443 HTTPS)
  │
  ├── admin.waly.app      → /var/www/admin-portal/dist/ (static SPA)
  ├── api.waly.app        → localhost:8090 (PocketBase)
  └── app.waly.app        → (future mobile web mirror)
```

---

## 3. Production Build

```bash
# In admin-portal/
npm run build
# Output: admin-portal/dist/
#   index.html
#   assets/index-[hash].js
#   assets/index-[hash].css
```

---

## 4. Caddyfile Configuration

```caddy
admin.waly.app {
  root * /var/www/admin-portal/dist

  # SPA fallback — all routes serve index.html
  try_files {path} /index.html

  # Cache hashed assets forever
  @assets {
    path /assets/*
  }
  header @assets Cache-Control "public, max-age=31536000, immutable"

  # No cache for HTML entry point
  header /index.html Cache-Control "no-store"

  file_server

  # Logging
  log {
    output file /var/log/caddy/admin.waly.app.log
    format json
  }
}

api.waly.app {
  reverse_proxy localhost:8090

  # Allow admin portal CORS
  header Access-Control-Allow-Origin "https://admin.waly.app"
  header Access-Control-Allow-Methods "GET, POST, PATCH, DELETE, OPTIONS"
  header Access-Control-Allow-Headers "Authorization, Content-Type"
}
```

---

## 5. Environment Configuration

```bash
# admin-portal/.env.production
VITE_POCKETBASE_URL=https://api.waly.app
VITE_APP_NAME=WALY Admin Portal
VITE_APP_ENV=production
```

---

## 6. Deployment Script

```bash
#!/bin/bash
# deploy-admin.sh

set -e

echo "🏗️  Building admin portal..."
cd /home/deploy/admin-portal
git pull origin main
npm ci
npm run build

echo "📦  Deploying to web root..."
rm -rf /var/www/admin-portal/dist
cp -r dist /var/www/admin-portal/

echo "🔄  Reloading Caddy..."
sudo systemctl reload caddy

echo "✅  Admin portal deployed successfully!"
echo "🌐  https://admin.waly.app"
```

---

## 7. Docker Compose (Optional)

```yaml
# docker-compose.yml (admin-portal service)
services:
  admin-portal:
    image: nginx:alpine
    volumes:
      - ./admin-portal/dist:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    ports:
      - "3001:80"
    restart: unless-stopped
```

---

## 8. CI/CD (GitHub Actions)

```yaml
# .github/workflows/deploy-admin.yml
name: Deploy Admin Portal

on:
  push:
    branches: [main]
    paths: ['admin-portal/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
        working-directory: admin-portal
      - run: npm run build
        working-directory: admin-portal
        env:
          VITE_POCKETBASE_URL: ${{ secrets.POCKETBASE_URL }}
      - name: Deploy to server
        uses: appleboy/scp-action@v0.1.7
        with:
          host:     ${{ secrets.SERVER_HOST }}
          username: deploy
          key:      ${{ secrets.SSH_KEY }}
          source:   "admin-portal/dist/*"
          target:   "/var/www/admin-portal/"
```

---

## 9. Related Documents

| Doc | Description |
|---|---|
| [41-development-roadmap.md](./41-development-roadmap.md) | Phase plan and milestones |
| [40-caching-strategy.md](../20-performance/40-caching-strategy.md) | Caddy cache headers |
| [43-monitoring.md](../22-monitoring-logging/43-monitoring.md) | Post-deploy health checks |
