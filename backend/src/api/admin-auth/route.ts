import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { 
  authRateLimit, 
  validateLogin, 
  checkValidationResult,
  requestLogger 
} from "../../middleware/security";
import { adminAuthService } from "../../services/admin-auth";

// 管理員登入（繞過 Medusa admin auth）
export const POST = [
  requestLogger,
  authRateLimit,
  validateLogin,
  checkValidationResult,
  async (req: MedusaRequest, res: MedusaResponse) => {
    try {
      const { email, password } = req.body as { email: string; password: string };

      const result = await adminAuthService.loginAdmin(email, password);
      if (!result) {
        return res.status(401).json({
          success: false,
          error: "登入失敗：郵箱或密碼錯誤"
        });
      }

      return res.json({
        success: true,
        message: "登入成功",
        data: {
          admin: result.admin,
          token: result.token
        }
      });
    } catch (error) {
      console.error('Admin login error:', error);
      return res.status(500).json({
        success: false,
        error: "登入服務異常"
      });
    }
  }
];

// 管理員列表（需要認證）
export const GET = [
  requestLogger,
  authRateLimit,
  async (req: MedusaRequest, res: MedusaResponse) => {
    try {
      // 驗證 token
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({
          success: false,
          error: "請提供認證 token"
        });
      }

      const payload = adminAuthService.verifyToken(token);
      if (!payload) {
        return res.status(401).json({
          success: false,
          error: "無效的認證 token"
        });
      }

      const admins = await adminAuthService.getAdmins();
      return res.json({
        success: true,
        data: { admins }
      });
    } catch (error) {
      console.error('Get admins error:', error);
      return res.status(500).json({
        success: false,
        error: "獲取管理員列表失敗"
      });
    }
  }
];
