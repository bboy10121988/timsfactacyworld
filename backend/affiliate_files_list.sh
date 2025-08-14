#!/bin/bash

# 聯盟系統檔案複製腳本
# 同事需要從 ray0808 分支複製到自己分支的檔案清單

echo "🚀 聯盟系統 - 必要檔案清單"
echo "=================================="

echo ""
echo "📁 Migration 檔案："
echo "backend/src/modules/affiliate/migrations/Migration20250811164316.ts"

echo ""
echo "📁 模組檔案："
echo "backend/src/modules/affiliate/index.ts"
echo "backend/src/modules/affiliate/models/affiliate-partner.ts"
echo "backend/src/modules/affiliate/models/affiliate-click.ts"  
echo "backend/src/modules/affiliate/models/affiliate-conversion.ts"
echo "backend/src/modules/affiliate/services/affiliate-minimal.ts"

echo ""
echo "📁 API 路由檔案："
find backend/src/api -name "*affiliate*" -type f | sort

echo ""
echo "📁 設定檔案："
echo "backend/medusa-config.ts (檢查 affiliate 模組設定)"
echo "backend/MERGE_INSTRUCTIONS.md (操作指南)"
echo "backend/manual_affiliate_tables.sql (手動建表 SQL)"

echo ""
echo "📁 測試檔案 (可選)："
find . -name "test-*affiliate*" -type f | head -5

echo ""
echo "🎯 快速執行步驟："
echo "1. 複製上述檔案"
echo "2. cd backend && npm install"
echo "3. npx medusa db:migrate"  
echo "4. 如失敗，執行: psql -d your_db -f manual_affiliate_tables.sql"
echo "5. 驗證: 檢查資料表是否建立成功"

echo ""
echo "✅ 完成後應該有 3 個新資料表："
echo "   - affiliate_partner"
echo "   - affiliate_click" 
echo "   - affiliate_conversion"
