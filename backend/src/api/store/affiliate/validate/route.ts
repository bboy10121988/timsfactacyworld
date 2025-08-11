import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

/**
 * GET /store/affiliate/validate?code=XXXX
 * 檢查聯盟代碼是否存在
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const code = (req.query?.code as string) || ""
    if (!code) return res.status(400).json({ success: false, message: "缺少必要參數：code" })
    // 暫時註解聯盟服務調用
    // const affiliateService = req.scope.resolve("affiliate") as any
    // const partners = await affiliateService.listAffiliatePartners({ filters: { affiliate_code: code } })
    // if (!partners.length) return res.json({ success: true, valid: false })
    // const { password, ...partner } = partners[0]
    // return res.json({ success: true, valid: true, partner })
    
    // 使用直接數據庫查詢
    const pgConnection = req.scope.resolve("__pg_connection__")
    const partners = await pgConnection
      .select('*')
      .from('affiliate_partner')
      .where('affiliate_code', code)
      .whereNull('deleted_at')
      
    if (!partners.length) return res.json({ success: true, valid: false })
    const { password, ...partner } = partners[0]
    return res.json({ success: true, valid: true, partner })
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message || '驗證失敗' })
  }
}
