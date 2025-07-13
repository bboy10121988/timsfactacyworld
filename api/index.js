const { MedusaModule } = require("@medusajs/framework/modules-sdk")
const { medusaIntegrationTestRunner } = require("@medusajs/test-utils")

module.exports = async (req, res) => {
  // Vercel serverless function handler for Medusa
  try {
    const { default: medusaApp } = await import("../backend/src/api/index.js")
    return medusaApp(req, res)
  } catch (error) {
    console.error("Medusa serverless function error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}
