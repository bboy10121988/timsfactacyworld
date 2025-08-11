import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

/**
 * POST /store/affiliate/test-db
 * 測試資料庫連接
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    console.log("測試資料庫連接...")
    
    // 測試不同的資料庫連接方式
    const methods = [
      'pgConnection', 
      '__db_connection__', 
      'dbConnection',
      'manager',
      'database'
    ]
    
    const results: any = {}
    
    for (const method of methods) {
      try {
        const connection = req.scope.resolve(method)
        results[method] = {
          exists: !!connection,
          type: typeof connection,
          keys: connection ? Object.keys(connection).slice(0, 10) : []
        }
      } catch (error) {
        results[method] = {
          exists: false,
          error: (error as Error).message
        }
      }
    }
    
    return res.json({
      success: true,
      results,
      available_services: Object.keys(req.scope.registrations)
    })
    
  } catch (error: any) {
    console.error("測試錯誤:", error)
    
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}
