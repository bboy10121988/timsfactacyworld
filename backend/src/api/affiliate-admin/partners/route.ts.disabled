import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import AffiliateService from "../../../modules/affiliate/services/affiliate";
import { 
  apiRateLimit, 
  validatePagination,
  checkValidationResult,
  requestLogger 
} from "../../../middleware/security";

const affiliateService = new AffiliateService();

/**
 * GET /affiliate-admin/partners
 * 取得聯盟夥伴列表（後台管理）- 使用 Medusa 原生認證
 */
export const GET = [
  requestLogger,
  apiRateLimit,
  validatePagination,
  checkValidationResult,
  async (req: MedusaRequest, res: MedusaResponse) => {
    try {
      // 檢查 Medusa 認證 - 使用正確的屬性名稱
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: "需要管理員認證"
        });
      }

      const { status, page = "1", limit = "20" } = req.query as {
        status?: string
        page?: string
        limit?: string
      }

      const result = await affiliateService.getPartners({
        status,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
      });

      return res.json({
        success: true,
        data: {
          partners: result.partners.map(p => ({
            ...p,
            conversionCount: p.conversions?.length || 0,
            totalCommission: p.conversions?.reduce((sum: number, c: any) => sum + (c.commissionAmount || 0), 0) || 0
          })),
          pagination: {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            total: result.total,
            totalPages: Math.ceil(result.total / parseInt(limit, 10))
          }
        }
      })

    } catch (error: any) {
      console.error("取得夥伴列表錯誤:", error)
      return res.status(500).json({
        success: false,
        message: error.message || "取得失敗"
      })
    }
  }
];
