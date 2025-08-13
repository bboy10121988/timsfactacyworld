import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import jwt from "jsonwebtoken"

/**
 * POST /admin-auth
 * 管理員登入
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { email, password } = req.body as { email: string; password: string }

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "缺少必要資料：email, password"
      })
    }

    // 簡單的硬編碼管理員驗證
    const validAdmins = [
      { email: 'admin@timsfactory.com', password: 'admin123', role: 'super_admin' },
      { email: 'admin@medusa-test.com', password: 'supersecret', role: 'admin' }
    ]

    const admin = validAdmins.find(a => a.email === email && a.password === password)
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        error: "登入失敗：郵箱或密碼錯誤"
      })
    }

    // 生成 JWT token
    const jwtSecret = process.env.JWT_SECRET || 'supersecret'
    const token = jwt.sign(
      { 
        id: `admin_${admin.email}`,
        email: admin.email,
        role: admin.role,
        type: 'admin'
      },
      jwtSecret,
      { expiresIn: '24h' }
    )

    return res.json({
      success: true,
      message: "登入成功",
      data: {
        admin: {
          email: admin.email,
          role: admin.role
        },
        token
      }
    })

  } catch (error) {
    console.error('Admin login error:', error)
    return res.status(500).json({
      success: false,
      error: "登入服務異常"
    })
  }
}
