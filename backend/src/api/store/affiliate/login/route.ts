import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

/**
 * POST /store/affiliate/login
 * 聯盟夥伴登入
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { email, password } = req.body as {
      email: string
      password: string
    }

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "缺少必要資料：email, password"
      })
    }

    // 使用 Knex 查詢
    const pgConnection = req.scope.resolve("__pg_connection__")
    
    const result = await pgConnection
      .select('*')
      .from('affiliate_partner')
      .where('email', email)
      .whereNull('deleted_at')
      .first()

    if (!result) {
      return res.status(400).json({
        success: false,
        message: "找不到此電子郵件的聯盟帳號",
        hint: "可用測試帳號：ming@example.com (密碼: password123), ya@beautyblog.com, hua@lifestyle.tw, ting@momblog.com, jay@techreview.tw"
      })
    }

    const partner = result

    // 檢查密碼
    const passwordMatch = await bcrypt.compare(password, partner.password_hash)
    if (!passwordMatch) {
      return res.status(400).json({
        success: false,
        message: "密碼錯誤"
      })
    }

    // 生成 JWT token
    const token = jwt.sign(
      { id: partner.id, email: partner.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    )

    // 移除敏感資料
    const { password_hash, ...safePartner } = partner

    return res.json({
      success: true,
      message: "登入成功",
      partner: safePartner,
      token
    })

  } catch (error: any) {
    console.error("登入錯誤:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "登入過程中發生錯誤"
    })
  }
}
