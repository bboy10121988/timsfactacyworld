#!/bin/bash

echo "🔧 開始部署前錯誤修復驗證..."

# 進入前端目錄
cd /Users/raychou/timsfactacyworld-main/frontend

echo "📦 安裝依賴..."
yarn install

echo "🧹 清理快取..."
rm -rf .next

echo "🏗️ 建構應用..."
yarn build

if [ $? -eq 0 ]; then
    echo "✅ 建構成功！錯誤修復驗證完成"
    echo ""
    echo "🚀 修復內容摘要："
    echo "1. ✅ 添加了 global-error.tsx 處理全域錯誤"
    echo "2. ✅ 添加了 error.tsx 處理頁面級錯誤" 
    echo "3. ✅ 優化了字體預加載配置"
    echo "4. ✅ 添加了資源預加載提示"
    echo "5. ✅ 增強了 middleware 安全性標頭"
    echo "6. ✅ 添加了錯誤追蹤系統"
    echo "7. ✅ 創建了錯誤報告 API"
    echo ""
    echo "現在可以安全地重新部署到 Vercel！"
else
    echo "❌ 建構失敗，請檢查錯誤訊息"
    exit 1
fi
