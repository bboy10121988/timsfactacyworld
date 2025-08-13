import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

/**
 * PUT /store/affiliate/payment
 * 更新聯盟夥伴付款資訊
 */
export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  console.log("=== 更新付款資訊請求 ===")
  console.log("Body:", req.body)
  
  try {
    const body = req.body as {
      partnerId: string
      accountName?: string
      bankCode?: string
      accountNumber?: string
      taxId?: string
    }

    const { partnerId, accountName, bankCode, accountNumber, taxId } = body

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

    if (accountName !== undefined) updateData.account_name = accountName
    if (bankCode !== undefined) updateData.bank_code = bankCode
    if (accountNumber !== undefined) updateData.account_number = accountNumber
    if (taxId !== undefined) updateData.tax_id = taxId

    console.log('更新付款資料:', updateData)

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
      message: "付款資訊更新成功",
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
    console.error("更新付款資訊錯誤:", error)
    return res.status(500).json({
      success: false,
      message: "更新付款資訊失敗",
      error: error.message
    })
  }
}
