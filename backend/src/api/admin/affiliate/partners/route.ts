import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { AffiliateModuleService } from "../../../../modules/affiliate"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const affiliateModuleService: AffiliateModuleService = req.scope.resolve("affiliate")

  const { limit = 20, offset = 0, q, status } = req.query

  try {
    const query: any = {}
    
    if (q) {
      query.$or = [
        { name: { $ilike: `%${q}%` } },
        { email: { $ilike: `%${q}%` } },
        { affiliate_code: { $ilike: `%${q}%` } }
      ]
    }

    if (status) {
      query.status = status
    }

    const partners = await affiliateModuleService.listAffiliatePartners(query, {
      skip: Number(offset),
      take: Number(limit)
    })

    // 獲取統計數據
    const allPartners = await affiliateModuleService.listAffiliatePartners()
    const stats = {
      total_partners: allPartners.length,
      pending_partners: allPartners.filter(p => p.status === "pending").length,
      active_partners: allPartners.filter(p => p.status === "active").length,
      rejected_partners: allPartners.filter(p => p.status === "rejected").length,
      suspended_partners: allPartners.filter(p => p.status === "suspended").length,
    }

    res.json({
      partners,
      stats,
      count: partners.length,
      offset: Number(offset),
      limit: Number(limit)
    })
  } catch (error) {
    console.error("Error fetching partners:", error)
    res.status(500).json({ 
      error: "Failed to fetch affiliate partners",
      message: error.message 
    })
  }
}

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const affiliateModuleService: AffiliateModuleService = req.scope.resolve("affiliate")

  const body = req.body as {
    name: string
    email: string
    phone?: string
    commission_rate: string
    bank_account_name?: string
    bank_account_number?: string
    bank_name?: string
    bank_branch?: string
  }

  const {
    name,
    email,
    phone,
    commission_rate,
    bank_account_name,
    bank_account_number,
    bank_name,
    bank_branch
  } = body

  // 生成唯一的聯盟代碼
  const code = `AF${Date.now()}`
  // 為管理員建立的夥伴生成預設密碼
  const defaultPassword = `temp${Date.now()}`

  const partner = await affiliateModuleService.createAffiliatePartner({
    name,
    email,
    password: defaultPassword,
    phone,
    commission_rate: parseFloat(commission_rate)
  })

  res.status(201).json({ partner })
}
