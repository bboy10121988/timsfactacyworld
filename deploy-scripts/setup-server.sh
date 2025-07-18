#!/bin/bash

set -e

echo "🚀 Setting up Medusa Demo Server on AWS EC2 (Amazon Linux 2023)..."

sudo dnf update -y

sudo dnf install -y postgresql15-server postgresql15
sudo postgresql-setup --initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql

sudo -u postgres createdb medusa_demo
sudo -u postgres psql -c "CREATE USER medusa WITH PASSWORD 'medusa123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE medusa_demo TO medusa;"

sudo dnf install -y redis
sudo systemctl enable redis
sudo systemctl start redis

sudo dnf install -y nginx
sudo systemctl enable nginx

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npm install -g pm2

sudo mkdir -p /var/www/medusa-demo
sudo chown ec2-user:ec2-user /var/www/medusa-demo

echo "✅ Server setup complete!"
