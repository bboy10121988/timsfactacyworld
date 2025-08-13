import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import bcrypt from "bcryptjs"

/**
 * POST /store/affiliate/register
 * 註冊聯盟夥伴（支援推薦制 ?ref= 或 body.referred_by_code）
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = (req.body || {}) as any
    const { name, email, password, phone, website } = body
    // 從 query 或 body 取得 ref 推薦碼
    const referred_by_code = (req.query?.ref as string) || body.referred_by_code || null

    console.log("=== 收到註冊請求 ===")
    console.log("Body:", { name, email, phone, website, referred_by_code })

    // 輸入驗證
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "缺少必要資料：name, email, password" })
    }

    // 郵箱格式驗證
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "郵箱格式不正確" })
    }

    // 密碼強度驗證
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "密碼長度至少需要6個字符" })
    }

    // 直接使用數據庫連接來創建夥伴，避免服務依賴注入問題
    const pgConnection = req.scope.resolve("__pg_connection__")
    
    // 檢查郵箱是否已存在
    const existing = await pgConnection
      .select('*')
      .from('affiliate_partner')
      .where('email', email)
      .first()

    if (existing) {
      return res.status(409).json({ success: false, message: "此電子郵件已被使用" })
    }

    // 生成聯盟代碼並檢查重複
    let affiliateCode = `${name.substring(0, 4).toUpperCase()}2025`
    let codeExists = await pgConnection
      .select('*')
      .from('affiliate_partner')
      .where('affiliate_code', affiliateCode)
      .first()

    // 如果代碼重複，添加隨機數字
    let counter = 1
    while (codeExists) {
      affiliateCode = `${name.substring(0, 4).toUpperCase()}${String(counter).padStart(3, '0')}`
      codeExists = await pgConnection
        .select('*')
        .from('affiliate_partner')
        .where('affiliate_code', affiliateCode)
        .first()
      counter++
      
      if (counter > 999) {
        return res.status(500).json({ success: false, message: "無法生成唯一的聯盟代碼" })
      }
    }

    const referralLink = `https://timsfantasyworld.com?ref=${affiliateCode}`

    // 雜湊密碼
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // 驗證推薦人代碼
    let referrerExists = false
    let referrerPartner = null
    if (referred_by_code) {
      referrerPartner = await pgConnection
        .select('*')
        .from('affiliate_partner')
        .where('affiliate_code', referred_by_code)
        .where('status', 'approved')
        .first()
      
      referrerExists = !!referrerPartner
      if (!referrerExists) {
        console.warn(`推薦人代碼 ${referred_by_code} 不存在或未核准`)
      }
    }

    // 創建新夥伴
    const newPartner = {
      id: `aff_${Date.now()}`,
      name: name,
      email: email,
      phone: phone || null,
      website: website || null,
      partner_code: affiliateCode,
      affiliate_code: affiliateCode,
      referral_link: referralLink,
      password_hash: hashedPassword,
      referred_by_code: (referred_by_code && referrerExists) ? referred_by_code : null,
      status: 'pending',
      commission_rate: 0.05, // 5% 默認佣金率
      created_at: new Date(),
      updated_at: new Date()
    }

    await pgConnection('affiliate_partner').insert(newPartner)

    // 如果有推薦人，更新推薦人的推薦數量
    if (newPartner.referred_by_code && referrerPartner) {
      await pgConnection('affiliate_partner')
        .where('affiliate_code', newPartner.referred_by_code)
        .increment('total_referrals', 1)
      
      console.log(`✅ ${newPartner.referred_by_code} 成功推薦了 ${affiliateCode}`)
    }
    
    const result = { 
      success: true, 
      message: "註冊成功，請等待審核", 
      partner: {
        id: newPartner.id,
        name: newPartner.name,
        email: newPartner.email,
        phone: newPartner.phone,
        website: newPartner.website,
        partner_code: newPartner.partner_code,
        affiliate_code: newPartner.affiliate_code,
        referral_link: newPartner.referral_link,
        status: newPartner.status,
        commission_rate: newPartner.commission_rate,
        created_at: newPartner.created_at
      },
      referrer_info: newPartner.referred_by_code ? {
        referred_by: newPartner.referred_by_code,
        referrer_name: referrerPartner ? (referrerPartner as any).name : '未知',
        message: "您將享受推薦制佣金分配"
      } : null
    }

    if (result.success) {
      console.log(`✅ 聯盟夥伴註冊成功: ${name} (${email})`)
      if (referred_by_code) {
        console.log(`🔗 推薦人: ${referred_by_code}`)
      }
    }
    
    return res.json(result)
  } catch (error: any) {
    console.error("註冊錯誤:", error)
    
    // 改善錯誤處理
    let statusCode = 400
    let message = error.message || "註冊失敗"
    
    if (message.includes("此電子郵件已被使用")) {
      message = "此電子郵件已經註冊過聯盟帳號"
      statusCode = 409
    }
    
    return res.status(statusCode).json({ success: false, message })
  }
}
