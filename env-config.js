// ========================================
// 動態環境變數配置
// 這個文件會被其他 JavaScript 文件引用
// ========================================

const ENV_CONFIG = {
  SERVER_IP: '34.81.21.61',
  BACKEND_URL: 'http://34.81.21.61:9000',
  FRONTEND_URL: 'http://34.81.21.61:8000',
  ADMIN_URL: 'http://34.81.21.61:9001',
  
  // 端口
  BACKEND_PORT: 9000,
  FRONTEND_PORT: 8000,
  ADMIN_PORT: 9001,
  
  // 本地開發
  LOCAL_BACKEND_URL: 'http://localhost:9000',
  LOCAL_FRONTEND_URL: 'http://localhost:8000',
  LOCAL_ADMIN_URL: 'http://localhost:9001',
  
  // 運行環境判斷
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  
  // 獲取適當的 URL (根據環境自動選擇)
  getBackendUrl: () => {
    if (typeof window !== 'undefined') {
      // 瀏覽器環境
      return process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://34.81.21.61:9000';
    }
    // Node.js 環境
    return process.env.NODE_ENV === 'production' ? 'http://34.81.21.61:9000' : 'http://localhost:9000';
  },
  
  getFrontendUrl: () => {
    if (typeof window !== 'undefined') {
      return process.env.NEXT_PUBLIC_BASE_URL || 'http://34.81.21.61:8000';
    }
    return process.env.NODE_ENV === 'production' ? 'http://34.81.21.61:8000' : 'http://localhost:8000';
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
