// 開發時錯誤追蹤工具
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // 監聽未處理的錯誤
  window.addEventListener('error', (event) => {
    console.error('客戶端錯誤:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
    });
  });

  // 監聽未處理的 Promise 拒絕
  window.addEventListener('unhandledrejection', (event) => {
    console.error('未處理的 Promise 拒絕:', event.reason);
  });

  // 監聽 Next.js 錯誤
  if (typeof window.__NEXT_DATA__ !== 'undefined') {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      if (args[0]?.includes?.('Server Error') || args[0]?.includes?.('digest')) {
        console.log('🔍 Next.js Server Error 詳情:', args);
      }
      originalConsoleError.apply(console, args);
    };
  }
}

// 生產環境錯誤報告
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  window.addEventListener('error', (event) => {
    // 可以在這裡添加錯誤報告服務（如 Sentry）
    fetch('/api/error-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: event.message,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {
      // 忽略錯誤報告失敗
    });
  });
}

export {};
