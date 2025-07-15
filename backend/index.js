// Vercel Serverless Function Entry Point for Medusa
const { createMedusaContainer } = require('@medusajs/framework/utils')
const express = require('express')

let app = null

const initializeApp = async () => {
  if (app) return app

  try {
    // Initialize Medusa container
    const container = await createMedusaContainer()
    
    // Create Express app
    app = express()
    
    // Medusa middleware
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    
    // Basic health check
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() })
    })
    
    // Medusa API routes would go here
    // This is a simplified version - full Medusa integration would be more complex
    
    return app
  } catch (error) {
    console.error('Failed to initialize Medusa:', error)
    throw error
  }
}

module.exports = async (req, res) => {
  try {
    const app = await initializeApp()
    return app(req, res)
  } catch (error) {
    console.error('Serverless function error:', error)
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    })
  }
}
