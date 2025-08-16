#!/bin/bash

# VM Redis 完整安裝和配置腳本
echo "開始在 VM 上安裝和配置 Redis..."

# 更新系統
sudo apt update
sudo apt upgrade -y

# 安裝 Redis
sudo apt install -y redis-server

# 配置 Redis 允許外部連接
sudo sed -i 's/bind 127.0.0.1/bind 0.0.0.0/' /etc/redis/redis.conf
sudo sed -i 's/# requirepass foobared/requirepass medusa123/' /etc/redis/redis.conf

# 設置 Redis 為系統服務並啟動
sudo systemctl enable redis-server
sudo systemctl restart redis-server

# 檢查 Redis 狀態
sudo systemctl status redis-server

# 測試 Redis 連接
redis-cli ping

# 開放防火牆端口 (如果需要)
sudo ufw allow 6379/tcp

echo "Redis 安裝和配置完成！"
echo "Redis 服務狀態:"
sudo systemctl is-active redis-server
echo "Redis 端口檢查:"
sudo netstat -tlnp | grep :6379
