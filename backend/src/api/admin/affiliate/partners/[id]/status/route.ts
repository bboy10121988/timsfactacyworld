import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

interface UpdateStatusRequest {
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  notes?: string
}

/**
 * PUT /admin/affiliate/partners/:id/status
 * 更新聯盟夥伴狀態（後台管理）
 */
export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const { id } = req.params
    const { status, notes } = req.body as UpdateStatusRequest

    // 驗證狀態
    const validStatuses = ['pending', 'approved', 'rejected', 'suspended']
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: "無效的狀態值", 
        validStatuses 
      })
    }

    // 查找夥伴
    const { data: partners } = await query.graph({
      entity: "affiliate_partner",
      fields: ["id", "status", "name", "email"],
      filters: { id }
    })

    if (!partners || partners.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "找不到聯盟夥伴" 
      })
    }

    const partner = partners[0]

    // 更新狀態
    const updateData: any = { 
      status,
      updated_at: new Date()
    }

    if (notes) {
      updateData.notes = notes
    }

    if (status === 'approved') {
      updateData.approved_at = new Date()
    }

    await query.graph({
      entity: "affiliate_partner",
      filters: { id },
      data: updateData
    })

    return res.json({ 
      success: true,
      message: "狀態更新成功",
      partner: {
        ...partner,
        status,
        notes,
        updated_at: updateData.updated_at
      }
    })
  } catch (error: any) {
    console.error('更新狀態失敗:', error)
    return res.status(500).json({ 
      success: false,
      message: error.message || "更新狀態失敗"
    })
  }
}
