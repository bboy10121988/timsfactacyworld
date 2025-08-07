import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { AffiliateModuleService } from "../../../../modules/affiliate"

/**
 * 創建聯盟夥伴申請
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const affiliateModuleService: AffiliateModuleService = req.scope.resolve(
      "affiliate"
    )

  const body = req.body as {
    email: string
    name: string
    password: string
    company?: string
    phone?: string
    commission_rate?: number
    commission_type?: "percentage" | "fixed"
  }

  const { email, name, password, company, phone, commission_rate, commission_type } = body

  if (!email || !name || !password) {
    res.status(400).json({
      error: "Email, name, and password are required"
    })
    return
  }

  try {
    const partner = await affiliateModuleService.createAffiliatePartner({
      email,
      name,
      password, // 添加密碼欄位
      company,
      phone,
      commission_rate: commission_rate || 0.05, // 默認 5%
      commission_type: commission_type || "percentage",
    })

    res.json({
      success: true,
      partner: {
        id: partner.id,
        email: partner.email,
        name: partner.name,
        affiliate_code: partner.affiliate_code,
        referral_link: partner.referral_link,
        status: partner.status,
        commission_rate: partner.commission_rate,
        commission_type: partner.commission_type,
      },
      message: "Affiliate partner application submitted successfully"
    })

  } catch (error: any) {
    console.error("Error creating affiliate partner:", error)
    res.status(500).json({
      error: "Failed to create affiliate partner",
      message: error.message
    })
  }
  } catch (serviceError: any) {
    console.error("Service resolution error:", serviceError)
    res.status(500).json({
      error: "Service not available",
      message: serviceError.message
    })
  }
}

/**
 * 獲取聯盟夥伴資訊
 */
export async function GET(
  request: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const email = request.query?.email as string
  
  try {
    const affiliateService = request.scope.resolve("affiliate")
    
    if (email) {
      // 檢查特定 email 的夥伴
      const partners = await affiliateService.listAffiliatePartners()
      const partner = partners.find(p => p.email === email)
      
      if (partner) {
        res.status(200).json({ 
          exists: true,
          partner: {
            id: partner.id,
            name: partner.name,
            email: partner.email,
            status: partner.status,
            affiliate_code: partner.affiliate_code,
            created_at: partner.created_at
          }
        })
      } else {
        res.status(200).json({ exists: false })
      }
    } else {
      // 返回所有夥伴（原有功能）
      const partners = await affiliateService.listAffiliatePartners()
      res.status(200).json({ partners })
    }
  } catch (error) {
    console.error("Error in GET /store/affiliate/partners:", error)
    res.status(500).json({ 
      error: "Failed to fetch affiliate partners",
      message: error.message 
    })
  }
}
