import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

/**
 * 核准或拒絕聯盟夥伴申請
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const affiliateModuleService = req.scope.resolve("affiliate")

    const { id } = req.params as { id: string }
    const { action, reason } = req.body as { 
      action: "approve" | "reject"
      reason?: string 
    }

    if (!id) {
      res.status(400).json({
        error: "Partner ID is required"
      })
      return
    }

    if (!action || !["approve", "reject"].includes(action)) {
      res.status(400).json({
        error: "Valid action (approve/reject) is required"
      })
      return
    }

    // 查找夥伴
    const partners = await affiliateModuleService.listAffiliatePartners({
      id
    })

    if (!partners || partners.length === 0) {
      res.status(404).json({
        error: "Affiliate partner not found"
      })
      return
    }

    const partner = partners[0]

    if (partner.status !== "pending") {
      res.status(400).json({
        error: "Only pending applications can be approved or rejected"
      })
      return
    }

    // 更新狀態
    const updatedPartner = await affiliateModuleService.updateAffiliatePartner(
      id,
      {
        status: action === "approve" ? "active" : "rejected",
        approved_at: action === "approve" ? new Date() : undefined,
        rejection_reason: action === "reject" ? reason : undefined,
        commission_rate: action === "approve" ? 0.05 : undefined, // 批准時設置 5% 佣金率
      }
    )

    res.json({
      success: true,
      partner: updatedPartner,
      message: action === "approve" 
        ? "Affiliate partner approved successfully" 
        : "Affiliate partner rejected"
    })

  } catch (error: any) {
    console.error("Error updating affiliate partner:", error)
    res.status(500).json({
      error: "Failed to update affiliate partner",
      message: error.message
    })
  }
}

/**
 * 更新聯盟夥伴資訊（通用更新）
 */
export async function PUT(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const affiliateModuleService = req.scope.resolve("affiliate")
    const { id } = req.params as { id: string }
    const updateData = req.body as any

    if (!id) {
      res.status(400).json({
        error: "Partner ID is required"
      })
      return
    }

    // 檢查夥伴是否存在
    const partners = await affiliateModuleService.listAffiliatePartners({
      id: id
    })

    if (!partners || partners.length === 0) {
      res.status(404).json({
        error: "Affiliate partner not found"
      })
      return
    }

    // 準備更新數據
    const updates: any = {}
    
    if (updateData.status) {
      updates.status = updateData.status
      if (updateData.status === 'active') {
        updates.approved_at = new Date()
      }
    }
    
    if (updateData.commission_rate !== undefined) {
      updates.commission_rate = updateData.commission_rate
    }
    
    if (updateData.commission_type) {
      updates.commission_type = updateData.commission_type
    }
    
    if (updateData.rejection_reason) {
      updates.rejection_reason = updateData.rejection_reason
    }

    // 更新夥伴
    const updatedPartner = await affiliateModuleService.updateAffiliatePartner(id, updates)

    res.json({
      success: true,
      partner: updatedPartner,
      message: "Partner updated successfully"
    })

  } catch (error: any) {
    console.error("Error updating affiliate partner:", error)
    res.status(500).json({
      error: "Failed to update affiliate partner",
      message: error.message
    })
  }
}
