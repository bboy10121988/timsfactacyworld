import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import bcrypt from "bcrypt"

/**
 * GET /store/affiliate/profile
 * 獲取聯盟夥伴個人資料
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  console.log("=== 獲取個人資料請求 ===")
  
  try {
    // 從 token 中獲取合作夥伴 ID (這裡簡化處理)
    const partnerId = req.headers['x-partner-id'] || req.query.partnerId
    
    if (!partnerId) {
      return res.status(401).json({
        success: false,
        message: "未提供合作夥伴 ID"
      })
    }

    const pgConnection = req.scope.resolve("__pg_connection__")
    
    // 獲取合作夥伴資料
    const partner = await pgConnection
      .select('*')
      .from('affiliate_partner')
      .where('id', partnerId)
      .whereNull('deleted_at')
      .first()

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "找不到合作夥伴資料"
      })
    }

    // 移除敏感資料
    const { password_hash, ...safePartner } = partner

    return res.status(200).json({
      success: true,
      partner: {
        id: safePartner.id,
        name: safePartner.name,
        email: safePartner.email,
        phone: safePartner.phone,
        website: safePartner.website,
        socialMedia: safePartner.social_media,
        address: safePartner.address,
        accountName: safePartner.account_name,
        bankCode: safePartner.bank_code,
        accountNumber: safePartner.account_number,
        taxId: safePartner.tax_id,
        uniqueCode: safePartner.partner_code,
        referralCode: safePartner.partner_code,
        referral_link: `http://localhost:8000/tw?ref=${safePartner.partner_code}`,
        status: safePartner.status,
        commissionRate: safePartner.commission_rate,
        createdAt: safePartner.created_at,
        updatedAt: safePartner.updated_at
      }
    })

  } catch (error) {
    console.error("獲取個人資料錯誤:", error)
    return res.status(500).json({
      success: false,
      message: "獲取個人資料失敗",
      error: error.message
    })
  }
}

/**
 * PUT /store/affiliate/profile
 * 更新聯盟夥伴個人資料
 */
export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  console.log("=== 更新個人資料請求 ===")
  console.log("Body:", req.body)
  
  try {
    const body = req.body as {
      partnerId: string
      name?: string
      phone?: string
      website?: string
      socialMedia?: string
      address?: string
    }

    const { partnerId, name, phone, website, socialMedia, address } = body

    if (!partnerId) {
      return res.status(400).json({
        success: false,
        message: "缺少合作夥伴 ID"
      })
    }

    const pgConnection = req.scope.resolve("__pg_connection__")
    
    // 檢查合作夥伴是否存在
    const existingPartner = await pgConnection
      .select('id')
      .from('affiliate_partner')
      .where('id', partnerId)
      .whereNull('deleted_at')
      .first()

    if (!existingPartner) {
      return res.status(404).json({
        success: false,
        message: "找不到合作夥伴"
      })
    }

    // 準備更新資料
    const updateData: any = {
      updated_at: new Date()
    }

    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (website !== undefined) updateData.website = website
    if (socialMedia !== undefined) updateData.social_media = socialMedia
    if (address !== undefined) updateData.address = address

    // 更新資料庫
    await pgConnection
      .update(updateData)
      .from('affiliate_partner')
      .where('id', partnerId)

    // 獲取更新後的資料
    const updatedPartner = await pgConnection
      .select('*')
      .from('affiliate_partner')
      .where('id', partnerId)
      .whereNull('deleted_at')
      .first()

    // 移除敏感資料
    const { password_hash, ...safePartner } = updatedPartner

    return res.status(200).json({
      success: true,
      message: "個人資料更新成功",
      partner: {
        id: safePartner.id,
        name: safePartner.name,
        email: safePartner.email,
        phone: safePartner.phone,
        website: safePartner.website,
        socialMedia: safePartner.social_media,
        address: safePartner.address,
        accountName: safePartner.account_name,
        bankCode: safePartner.bank_code,
        accountNumber: safePartner.account_number,
        taxId: safePartner.tax_id,
        uniqueCode: safePartner.partner_code,
        referralCode: safePartner.partner_code,
        referral_link: `http://localhost:8000/tw?ref=${safePartner.partner_code}`,
        status: safePartner.status,
        commissionRate: safePartner.commission_rate,
        createdAt: safePartner.created_at,
        updatedAt: safePartner.updated_at
      }
    })

  } catch (error) {
    console.error("更新個人資料錯誤:", error)
    return res.status(500).json({
      success: false,
      message: "更新個人資料失敗",
      error: error.message
    })
  }
}
