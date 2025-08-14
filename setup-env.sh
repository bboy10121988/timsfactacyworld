#!/bin/bash

# ========================================
# 環境變數自動配置腳本
# 使用方法: ./setup-env.sh [SERVER_IP]
# 例如: ./setup-env.sh 104.155.208.30
# ========================================

set -e

# 獲取當前目錄
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 檢查是否提供了 SERVER_IP 參數
if [ $# -eq 1 ]; then
    SERVER_IP="$1"
    echo "使用提供的 IP: $SERVER_IP"
elif [ -f "$SCRIPT_DIR/.env.template" ]; then
    # 從 .env.template 讀取當前配置的 IP
    SERVER_IP=$(grep "^SERVER_IP=" "$SCRIPT_DIR/.env.template" | cut -d'=' -f2)
    echo "從 .env.template 讀取到 IP: $SERVER_IP"
else
    echo "錯誤: 請提供 SERVER_IP 參數或確保 .env.template 文件存在"
    echo "使用方法: $0 [SERVER_IP]"
    exit 1
fi

if [ -z "$SERVER_IP" ]; then
    echo "錯誤: SERVER_IP 不能為空"
    exit 1
fi

echo "正在為 IP $SERVER_IP 配置環境變數..."

# 端口配置
BACKEND_PORT=9000
FRONTEND_PORT=8000
ADMIN_PORT=9001
DEV_PORT=3000
VITE_PORT=5173
ADMIN_DEV_PORT=7001

# 生成動態 URL
BACKEND_URL="http://${SERVER_IP}:${BACKEND_PORT}"
FRONTEND_URL="http://${SERVER_IP}:${FRONTEND_PORT}"
ADMIN_URL="http://${SERVER_IP}:${ADMIN_PORT}"

# 更新 .env.template
cat > "$SCRIPT_DIR/.env.template" << EOF
# ========================================
# 動態 IP 配置模板
# 這個文件用於生成所有需要的環境變數
# 當 IP 改變時，只需要修改這裡的 IP 地址，然後執行 setup-env.sh
# ========================================

# 當前伺服器 IP (需要根據實際情況修改)
SERVER_IP=${SERVER_IP}

# 端口配置
BACKEND_PORT=${BACKEND_PORT}
FRONTEND_PORT=${FRONTEND_PORT}
ADMIN_PORT=${ADMIN_PORT}
DEV_PORT=${DEV_PORT}
VITE_PORT=${VITE_PORT}
ADMIN_DEV_PORT=${ADMIN_DEV_PORT}

# 動態生成的 URL (不要手動修改這些)
BACKEND_URL=${BACKEND_URL}
FRONTEND_URL=${FRONTEND_URL}
ADMIN_URL=${ADMIN_URL}

# 本地開發環境 (保持不變)
LOCAL_BACKEND_URL=http://localhost:${BACKEND_PORT}
LOCAL_FRONTEND_URL=http://localhost:${FRONTEND_PORT}
LOCAL_ADMIN_URL=http://localhost:${ADMIN_PORT}
LOCAL_DEV_URL=http://localhost:${DEV_PORT}
EOF

# 1. 更新 backend/.env
echo "更新 backend/.env..."
if [ ! -f "$SCRIPT_DIR/backend/.env.backup" ]; then
    cp "$SCRIPT_DIR/backend/.env" "$SCRIPT_DIR/backend/.env.backup"
fi

# 讀取現有的 .env 文件並替換 IP 相關配置
sed -e "s|STORE_CORS=.*|STORE_CORS=http://localhost:${FRONTEND_PORT},http://localhost:${DEV_PORT},${FRONTEND_URL}|g" \
    -e "s|ADMIN_CORS=.*|ADMIN_CORS=http://localhost:${VITE_PORT},http://localhost:${BACKEND_PORT},http://localhost:${ADMIN_DEV_PORT},${BACKEND_URL},${ADMIN_URL}|g" \
    -e "s|AUTH_CORS=.*|AUTH_CORS=http://localhost:${VITE_PORT},http://localhost:${BACKEND_PORT},http://localhost:${FRONTEND_PORT},http://localhost:${ADMIN_DEV_PORT},${FRONTEND_URL},${BACKEND_URL},${ADMIN_URL}|g" \
    -e "s|AFFILIATE_BASE_URL=.*|AFFILIATE_BASE_URL=${BACKEND_URL}|g" \
    -e "s|FRONTEND_BASE_URL=.*|FRONTEND_BASE_URL=${FRONTEND_URL}|g" \
    "$SCRIPT_DIR/backend/.env.backup" > "$SCRIPT_DIR/backend/.env"

# 2. 更新 backend/.env.production
echo "更新 backend/.env.production..."
if [ ! -f "$SCRIPT_DIR/backend/.env.production.backup" ]; then
    cp "$SCRIPT_DIR/backend/.env.production" "$SCRIPT_DIR/backend/.env.production.backup"
fi

sed -e "s|STORE_CORS=.*|STORE_CORS=${FRONTEND_URL},http://localhost:${FRONTEND_PORT},http://localhost:${DEV_PORT}|g" \
    -e "s|ADMIN_CORS=.*|ADMIN_CORS=${BACKEND_URL},${ADMIN_URL},http://localhost:${VITE_PORT},http://localhost:${BACKEND_PORT},http://localhost:${ADMIN_DEV_PORT}|g" \
    -e "s|AUTH_CORS=.*|AUTH_CORS=${FRONTEND_URL},${BACKEND_URL},${ADMIN_URL},http://localhost:${VITE_PORT},http://localhost:${BACKEND_PORT},http://localhost:${FRONTEND_PORT},http://localhost:${ADMIN_DEV_PORT}|g" \
    "$SCRIPT_DIR/backend/.env.production.backup" > "$SCRIPT_DIR/backend/.env.production"

# 3. 更新 frontend/.env.production
echo "更新 frontend/.env.production..."
if [ ! -f "$SCRIPT_DIR/frontend/.env.production.backup" ]; then
    cp "$SCRIPT_DIR/frontend/.env.production" "$SCRIPT_DIR/frontend/.env.production.backup"
fi

sed -e "s|NEXT_PUBLIC_MEDUSA_BACKEND_URL=.*|NEXT_PUBLIC_MEDUSA_BACKEND_URL=${BACKEND_URL}|g" \
    -e "s|NEXT_PUBLIC_BASE_URL=.*|NEXT_PUBLIC_BASE_URL=${FRONTEND_URL}|g" \
    "$SCRIPT_DIR/frontend/.env.production.backup" > "$SCRIPT_DIR/frontend/.env.production"

# 4. 創建環境變數配置檔案
echo "創建環境變數配置檔案..."
cat > "$SCRIPT_DIR/env-config.js" << EOF
// ========================================
// 動態環境變數配置
// 這個文件會被其他 JavaScript 文件引用
// ========================================

const ENV_CONFIG = {
  SERVER_IP: '${SERVER_IP}',
  BACKEND_URL: '${BACKEND_URL}',
  FRONTEND_URL: '${FRONTEND_URL}',
  ADMIN_URL: '${ADMIN_URL}',
  
  // 端口
  BACKEND_PORT: ${BACKEND_PORT},
  FRONTEND_PORT: ${FRONTEND_PORT},
  ADMIN_PORT: ${ADMIN_PORT},
  
  // 本地開發
  LOCAL_BACKEND_URL: 'http://localhost:${BACKEND_PORT}',
  LOCAL_FRONTEND_URL: 'http://localhost:${FRONTEND_PORT}',
  LOCAL_ADMIN_URL: 'http://localhost:${ADMIN_PORT}',
  
  // 運行環境判斷
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  
  // 獲取適當的 URL (根據環境自動選擇)
  getBackendUrl: () => {
    if (typeof window !== 'undefined') {
      // 瀏覽器環境
      return process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || '${BACKEND_URL}';
    }
    // Node.js 環境
    return process.env.NODE_ENV === 'production' ? '${BACKEND_URL}' : 'http://localhost:${BACKEND_PORT}';
  },
  
  getFrontendUrl: () => {
    if (typeof window !== 'undefined') {
      return process.env.NEXT_PUBLIC_BASE_URL || '${FRONTEND_URL}';
    }
    return process.env.NODE_ENV === 'production' ? '${FRONTEND_URL}' : 'http://localhost:${FRONTEND_PORT}';
  }
};

// 支援 CommonJS 和 ES6 模組
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ENV_CONFIG;
}

if (typeof window !== 'undefined') {
  window.ENV_CONFIG = ENV_CONFIG;
}

export default ENV_CONFIG;
EOF

echo "✅ 環境變數配置完成！"
echo ""
echo "配置摘要:"
echo "- 伺服器 IP: $SERVER_IP"
echo "- 後端 URL: $BACKEND_URL"
echo "- 前端 URL: $FRONTEND_URL"
echo "- 管理面板 URL: $ADMIN_URL"
echo ""
echo "已更新的檔案:"
echo "- backend/.env"
echo "- backend/.env.production"
echo "- frontend/.env.production"
echo "- env-config.js"
echo ""
echo "備份檔案已保存為 *.backup"
echo ""
echo "🚀 現在可以重新部署您的應用程式!"
