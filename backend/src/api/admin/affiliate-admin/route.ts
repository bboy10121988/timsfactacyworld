import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { readFileSync } from "fs"
import { resolve } from "path"

/**
 * 提供聯盟管理界面
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const htmlPath = resolve(process.cwd(), 'src/admin/affiliate-management.html')
    const html = readFileSync(htmlPath, 'utf-8')
    
    res.setHeader('Content-Type', 'text/html')
    res.send(html)
  } catch (error) {
    console.error("Error serving affiliate management page:", error)
    res.status(500).json({
      error: "Failed to load affiliate management page"
    })
  }
}
