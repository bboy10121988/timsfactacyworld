module.exports = async (req, res) => {
  try {
    // 設定 CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Medusa-Access-Token')
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end()
      return
    }

    // 簡單的健康檢查響應
    if (req.url === '/api/health' || req.url === '/health') {
      res.status(200).json({
        status: 'ok',
        message: 'Medusa API is running on Vercel',
        timestamp: new Date().toISOString(),
        url: req.url
      })
      return
    }

    // 暫時回傳 API 正在建設中的訊息
    res.status(503).json({
      error: 'Service Temporarily Unavailable',
      message: 'Medusa API integration is under construction',
      timestamp: new Date().toISOString(),
      url: req.url
    })
    
  } catch (error) {
    console.error("API Error:", error)
    res.status(500).json({ 
      error: "Internal server error",
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }
}
