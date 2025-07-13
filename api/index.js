const path = require('path')

module.exports = async (req, res) => {
  // Vercel serverless function handler for Medusa backend
  try {
    // 設定 CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end()
      return
    }
    
    // 動態載入 Medusa 應用
    const { default: medusaApp } = await import(path.join(__dirname, '../backend/src/api/index.js'))
    return medusaApp(req, res)
  } catch (error) {
    console.error("Medusa serverless function error:", error)
    res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    })
  }
}
