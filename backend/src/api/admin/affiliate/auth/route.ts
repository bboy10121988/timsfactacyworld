import { Request, Response } from "express";
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { 
  authRateLimit, 
  validateLogin, 
  checkValidationResult,
  requestLogger 
} from "../../../../middleware/security";
import { adminAuthService } from "../../../../services/admin-auth";

// 管理員登入
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

// 管理員資訊
export const GET = [
  requestLogger,
  async (req: MedusaRequest, res: MedusaResponse) => {
    try {
      const admins = adminAuthService.getAdmins();
      
      return res.json({
        success: true,
        data: {
          admins: admins.map(admin => ({
            id: admin.id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
            createdAt: admin.createdAt,
            lastLoginAt: admin.lastLoginAt,
            isActive: admin.isActive
          }))
        }
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
