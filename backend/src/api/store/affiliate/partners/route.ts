import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import bcrypt from "bcrypt"

/**
 * POST /store/affiliate/partners
 * 註冊聯盟夥伴
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  console.log("=== 收到註冊請求 ===")
  console.log("Headers:", req.headers)
  console.log("Body:", req.body)
  
  try {
    const body = req.body as {
      name: string
      email: string
      phone?: string
      website?: string
      password: string
    }

    const { name, email, phone, website, password } = body
    console.log("解析的資料:", { name, email, phone, website, password: "***" })

    if (!name || !email || !password) {
      console.log("缺少必要資料")
      return res.status(400).json({
        success: false,
        message: "缺少必要資料：name, email, password"
      })
    }

    // 使用 Knex 連接資料庫
    const pgConnection = req.scope.resolve("__pg_connection__")
    
    // 檢查 email 是否已存在
    const existingPartner = await pgConnection
      .select('*')
      .from('affiliate_partner')
      .where('email', email)
      .whereNull('deleted_at')
      .first()

    if (existingPartner) {
      return res.status(400).json({
        success: false,
        message: "此電子郵件已被使用"
      })
    }

    // 生成唯一的夥伴 ID 和代碼
    const timestamp = Date.now().toString()
    const partnerId = `aff_${timestamp.slice(-6)}`
    const partnerCode = `${name.substring(0, 3).toUpperCase()}${timestamp.slice(-3)}`
    const affiliateCode = `${name.substring(0, 3).toUpperCase()}${timestamp.slice(-6)}`
    const referralLink = `https://timsfantasyworld.com?ref=${affiliateCode}`
    
    // 加密密碼
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // 插入新夥伴記錄
    const newPartner = {
      id: partnerId,
      name,
      email,
      phone: phone || null,
      website: website || null,
      password_hash: passwordHash,
      partner_code: partnerCode,
      affiliate_code: affiliateCode,
      referral_link: referralLink,
      commission_rate: '0.0500', // 5% 佣金率
      status: 'pending', // 待審核
      metadata: JSON.stringify({
        registered_from: 'web',
        registration_date: new Date().toISOString()
      }),
      total_orders: 0,
      total_commission_earned: '0.00',
      total_commission_paid: '0.00',
      created_at: new Date(),
      updated_at: new Date()
    }

    console.log("準備插入夥伴記錄:", newPartner)

    await pgConnection('affiliate_partner').insert(newPartner)

    console.log("註冊成功:", partnerId)

    // 返回結果（不包含密碼）
    const { password_hash, ...partnerResult } = newPartner
    
    return res.json({
      success: true,
      message: "註冊成功，請等待審核",
      partner: partnerResult
    })

  } catch (error: any) {
    console.error("註冊錯誤:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "註冊失敗"
    })
  }
}
/**
 * GET /store/affiliate/partners?email={email}
 * 檢查 email 是否已存在
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { email } = req.query as { email: string }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "缺少 email 參數"
      })
    }

    // 使用 Knex 連接資料庫
    const pgConnection = req.scope.resolve("__pg_connection__")
    
    const existingPartner = await pgConnection
      .select('*')
      .from('affiliate_partner')
      .where('email', email)
      .whereNull('deleted_at')
      .first()

    return res.json({
      success: true,
      exists: !!existingPartner
    })

  } catch (error: any) {
    console.error("檢查 email 錯誤:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "檢查失敗"
    })
  }
}
