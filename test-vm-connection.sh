#!/bin/bash

# 測試連接腳本
VM_IP="35.221.222.242"

echo "🔍 測試 VM 連接..."
echo "VM IP: $VM_IP"
echo

# 測試網路連通性
echo "📡 測試網路連通性..."
ping -c 3 $VM_IP

echo
echo "🗄️ 測試 PostgreSQL 連接..."
# 測試 PostgreSQL 端口
nc -zv $VM_IP 5432

echo
echo "🔴 測試 Redis 連接..."  
# 測試 Redis 端口
nc -zv $VM_IP 6379

echo
echo "🧪 測試 Redis ping..."
redis-cli -h $VM_IP -p 6379 ping

echo
echo "🧪 測試 PostgreSQL 查詢..."
psql "postgresql://medusa:medusa123@$VM_IP:5432/medusa_store" -c "SELECT version();"
