#!/bin/bash

# 停止所有現有進程
echo "停止現有進程..."
pkill -f yarn
pkill -f node
sleep 3

# 設置環境變數
export NODE_ENV=production

# 啟動後端 (無 admin)
echo "啟動後端服務..."
cd ~/timsfactacyworld/backend
nohup yarn start --port 9000 --host 0.0.0.0 > backend.log 2>&1 &

# 等待後端啟動
sleep 10

# 啟動前端
echo "啟動前端服務..."
cd ~/timsfactacyworld/frontend
nohup yarn start -p 3000 -H 0.0.0.0 > frontend.log 2>&1 &

# 等待啟動
sleep 10

# 檢查服務狀態
echo "檢查服務狀態..."
ps aux | grep -E "(yarn|node)" | grep -v grep

echo "服務啟動完成！"
echo "後端: http://0.0.0.0:9000"
echo "前端: http://0.0.0.0:3000"
