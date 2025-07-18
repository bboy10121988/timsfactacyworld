#!/bin/bash

set -e

APP_DIR="/var/www/medusa-demo"
REPO_URL="https://github.com/bboy10121988/timsfactacyworld.git"

echo "📦 Deploying Medusa Demo Application..."

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd /var/www
if [ -d "medusa-demo" ]; then
    cd medusa-demo
    git pull origin main
else
    git clone $REPO_URL medusa-demo
    cd medusa-demo
fi

echo "📦 Installing backend dependencies..."
cd backend
yarn install

echo "🔨 Building backend (including admin interface)..."
yarn build

echo "📦 Installing frontend dependencies..."
cd ../frontend
yarn install

echo "🔨 Building frontend..."
yarn build

echo "⚙️ Setting up environment variables..."
cd ../backend

PUBLIC_HOSTNAME=$(curl -s http://169.254.169.254/latest/meta-data/public-hostname)

cat > .env << EOF
DATABASE_URL=postgresql://medusa:medusa123@localhost:5432/medusa_demo
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-$(openssl rand -hex 32)
COOKIE_SECRET=your-super-secret-cookie-key-$(openssl rand -hex 32)
STORE_CORS=http://localhost:8000,http://$PUBLIC_HOSTNAME:8000,http://$PUBLIC_HOSTNAME
ADMIN_CORS=http://localhost:9000,http://$PUBLIC_HOSTNAME:9000
NODE_ENV=production
PORT=9000

ECPAY_MERCHANT_ID=3320313
ECPAY_HASH_KEY=KxLwdTeLpxdoFrR7
ECPAY_HASH_IV=BsjeGZXC1L66RrJb
EOF

cd ../frontend
cat > .env.production << EOF
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://$PUBLIC_HOSTNAME:9000
NEXT_PUBLIC_BASE_URL=http://$PUBLIC_HOSTNAME:8000
EOF

echo "🗄️ Setting up PostgreSQL database and user..."
sudo -u postgres psql -c "CREATE DATABASE medusa_demo;" 2>/dev/null || echo "Database already exists"
sudo -u postgres psql -c "CREATE USER medusa WITH PASSWORD 'medusa123';" 2>/dev/null || echo "User already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE medusa_demo TO medusa;" 2>/dev/null || echo "Privileges already granted"

echo "🗄️ Running database migrations..."
cd ../backend
yarn migrate

echo "🚀 Starting applications with PM2..."
pm2 delete all 2>/dev/null || true

pm2 start yarn --name "medusa-backend" -- start

cd ../frontend
pm2 start yarn --name "medusa-frontend" -- start

pm2 save
pm2 startup

echo "✅ Application deployed successfully!"
echo "🌐 Frontend: http://$PUBLIC_HOSTNAME:8000"
echo "🔧 Backend: http://$PUBLIC_HOSTNAME:9000"
echo "🔧 Admin: http://$PUBLIC_HOSTNAME:9000/app"
