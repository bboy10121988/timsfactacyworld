import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    return res.status(200).json({
      status: "ok",
      message: "Medusa backend is running",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      version: "2.8.7"
    })
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Health check failed",
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
