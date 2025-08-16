#!/bin/bash

# Redis 安裝和配置腳本
# 在 VM 上執行此腳本

set -e

echo "🔄 開始 Redis 安裝和配置..."

# 更新套件列表
echo "📦 更新套件列表..."
sudo apt update

# 安裝 Redis
echo "🔴 安裝 Redis..."
sudo apt install -y redis-server

# 檢查 Redis 服務狀態
echo "📊 檢查 Redis 狀態..."
sudo systemctl status redis-server --no-pager

# 備份原始配置文件
echo "💾 備份 Redis 配置文件..."
sudo cp /etc/redis/redis.conf /etc/redis/redis.conf.backup

# 修改 Redis 配置允許外部連接
echo "⚙️ 配置 Redis 允許外部連接..."
sudo sed -i 's/^bind 127.0.0.1/#bind 127.0.0.1/' /etc/redis/redis.conf
echo "bind 0.0.0.0" | sudo tee -a /etc/redis/redis.conf

# 關閉保護模式
sudo sed -i 's/protected-mode yes/protected-mode no/' /etc/redis/redis.conf

# 重啟 Redis 服務
echo "🔄 重啟 Redis 服務..."
sudo systemctl restart redis-server

# 啟用 Redis 開機自啟
echo "🚀 設定 Redis 開機自啟..."
sudo systemctl enable redis-server

# 開放防火牆端口
echo "🔥 開放 Redis 端口 6379..."
sudo ufw allow 6379

# 測試 Redis 連接
echo "🧪 測試 Redis 連接..."
redis-cli ping

# 檢查 Redis 是否監聽正確的地址
echo "👂 檢查 Redis 監聽狀態..."
sudo netstat -tlnp | grep :6379

echo "✅ Redis 配置完成！"
echo ""
echo "📋 配置摘要："
echo "- Redis 已安裝並運行"
echo "- 允許外部連接 (bind 0.0.0.0)"
echo "- 保護模式已關閉"
echo "- 防火牆端口 6379 已開放"
echo "- Redis 已設定開機自啟"
echo ""
echo "🔴 下一步："
echo "確保 GCP 防火牆規則允許端口 6379"
