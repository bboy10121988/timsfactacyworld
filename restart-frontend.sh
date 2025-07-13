#!/bin/bash

echo "🔄 重啟前端服務器以應用 CMS 路徑修復..."

# 停止現有的 Next.js 進程
echo "停止現有服務器..."
pkill -f "next dev" 2>/dev/null || true

# 等待一下確保進程完全停止
sleep 2

# 啟動前端服務器
echo "啟動前端服務器 (port 8000)..."
cd frontend && npm run dev -- --turbopack -p 8000 &

echo "✅ 前端服務器已重啟！"
echo ""
echo "🧪 測試連結："
echo "• 前端首頁: http://localhost:8000"
echo "• CMS Studio: http://localhost:8000/cms"
echo "• 系統資訊: http://localhost:8000/cms-info"
echo "• 整合測試: http://localhost:8000/integration-test"
echo ""
echo "📋 確認 /cms 不會重定向到 /tw/cms"
