import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import bcrypt from "bcrypt"

/**
 * PUT /store/affiliate/password
 * 更新聯盟夥伴密碼
 */
export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  console.log("=== 更新密碼請求 ===")
  
  try {
    const body = req.body as {
      partnerId: string
      currentPassword: string
      newPassword: string
    }

    const { partnerId, currentPassword, newPassword } = body

    if (!partnerId || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "缺少必要資料：partnerId, currentPassword, newPassword"
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "新密碼長度至少需要 6 個字元"
      })
    }

    const pgConnection = req.scope.resolve("__pg_connection__")
    
    // 獲取合作夥伴資料
    const partner = await pgConnection
      .select('id', 'password_hash')
      .from('affiliate_partner')
      .where('id', partnerId)
      .whereNull('deleted_at')
      .first()

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "找不到合作夥伴"
      })
    }

    // 驗證目前密碼
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, partner.password_hash)
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "目前密碼錯誤"
      })
    }

    // 加密新密碼
    const saltRounds = 12
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds)

    // 更新密碼
    await pgConnection
      .update({
        password_hash: newPasswordHash,
        updated_at: new Date()
      })
      .from('affiliate_partner')
      .where('id', partnerId)

    console.log("密碼更新成功:", partnerId)

    return res.status(200).json({
      success: true,
      message: "密碼更新成功"
    })

  } catch (error) {
    console.error("更新密碼錯誤:", error)
    return res.status(500).json({
      success: false,
      message: "更新密碼失敗",
      error: error.message
    })
  }
}
