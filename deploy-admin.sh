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
