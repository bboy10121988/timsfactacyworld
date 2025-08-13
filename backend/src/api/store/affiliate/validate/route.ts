import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

/**
 * GET /store/affiliate/validate?code=XXXX
 * 檢查聯盟代碼是否存在
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const code = (req.query?.code as string) || ""
    if (!code) return res.status(400).json({ success: false, message: "缺少必要參數：code" })
    // 使用數據庫查詢驗證聯盟代碼
    const pgConnection = req.scope.resolve("__pg_connection__")
    const partners = await pgConnection
      .select('*')
      .from('affiliate_partner')
      .where('affiliate_code', code)
      .where('status', 'approved') // 只返回已核准的夥伴
      .whereNull('deleted_at')
      .first()
      
    if (!partners) return res.json({ success: true, valid: false })
    
    // 移除敏感信息後返回夥伴資料
    const { password, ...partner } = partners
    return res.json({ success: true, valid: true, partner })
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message || '驗證失敗' })
  }
}
