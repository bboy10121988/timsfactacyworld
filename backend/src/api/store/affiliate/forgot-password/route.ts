import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const affiliateModuleService = req.scope.resolve("affiliate")

  const body = req.body as {
    email: string
  }

  const { email } = body

  if (!email) {
    res.status(400).json({
      error: "Email is required"
    })
    return
  }

  try {
    // 檢查 email 是否存在
    const partners = await affiliateModuleService.listAffiliatePartners()
    const partner = partners.find(p => p.email === email)

    if (!partner) {
      res.status(404).json({
        error: "Email not found",
        message: "此電子郵件未註冊聯盟夥伴帳號"
      })
      return
    }

    // 這裡應該生成重設密碼的 token 並發送郵件
    // 暫時返回成功訊息
    // TODO: 實作實際的密碼重設邏輯
    console.log(`Password reset requested for: ${email}`)
    
    res.json({
      success: true,
      message: "重設密碼連結已發送到您的電子郵件"
    })

  } catch (error) {
    console.error("Error in forgot password:", error)
    res.status(500).json({
      error: "Failed to process password reset request",
      message: error.message
    })
  }
}
