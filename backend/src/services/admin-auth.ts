import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: 'super_admin' | 'admin' | 'viewer';
  createdAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
}

// 預設管理員帳號 (生產環境應從資料庫讀取)
const defaultAdmins: AdminUser[] = [
  {
    id: uuidv4(),
    username: 'admin',
    email: 'admin@timsfactory.com',
    passwordHash: bcrypt.hashSync('admin123', 10), // 預設密碼：admin123
    role: 'super_admin',
    createdAt: new Date(),
    isActive: true
  },
  {
    id: uuidv4(),
    username: 'manager',
    email: 'manager@timsfactory.com',
    passwordHash: bcrypt.hashSync('manager123', 10), // 預設密碼：manager123
    role: 'admin',
    createdAt: new Date(),
    isActive: true
  }
];

export class AdminAuthService {
  private admins: AdminUser[] = [...defaultAdmins];

  // 管理員登入
  async loginAdmin(email: string, password: string): Promise<{ admin: AdminUser; token: string } | null> {
    try {
      const admin = this.admins.find(a => a.email === email && a.isActive);
      if (!admin) {
        return null;
      }

      const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
      if (!isValidPassword) {
        return null;
      }

      // 更新最後登入時間
      admin.lastLoginAt = new Date();

      // 生成 JWT Token
      const jwtSecret = process.env.JWT_SECRET || "your-super-secret-key-change-in-production";
      const token = jwt.sign(
        {
          id: admin.id,
          email: admin.email,
          username: admin.username,
          role: 'admin',
          adminRole: admin.role
        },
        jwtSecret,
        { expiresIn: '24h' } // 管理員 token 24小時過期
      );

      return {
        admin: {
          ...admin,
          passwordHash: undefined as any // 不返回密碼
        },
        token
      };
    } catch (error) {
      console.error('Admin login error:', error);
      return null;
    }
  }

  // 創建管理員
  async createAdmin(data: {
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'viewer';
  }): Promise<AdminUser> {
    const existingAdmin = this.admins.find(a => a.email === data.email);
    if (existingAdmin) {
      throw new Error('管理員郵箱已存在');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const newAdmin: AdminUser = {
      id: uuidv4(),
      username: data.username,
      email: data.email,
      passwordHash,
      role: data.role,
      createdAt: new Date(),
      isActive: true
    };

    this.admins.push(newAdmin);
    return { ...newAdmin, passwordHash: undefined as any };
  }

  // 獲取管理員列表
  getAdmins(): Omit<AdminUser, 'passwordHash'>[] {
    return this.admins.map(admin => ({
      ...admin,
      passwordHash: undefined as any
    }));
  }

  // 更新管理員狀態
  updateAdminStatus(adminId: string, isActive: boolean): boolean {
    const admin = this.admins.find(a => a.id === adminId);
    if (admin) {
      admin.isActive = isActive;
      return true;
    }
    return false;
  }

  // 驗證 JWT token
  verifyToken(token: string): any {
    try {
      const payload = jwt.verify(token, jwtSecret);
      return payload;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  // 驗證管理員權限
  hasPermission(adminRole: string, requiredRole: string): boolean {
    const roles = ['viewer', 'admin', 'super_admin'];
    const adminRoleIndex = roles.indexOf(adminRole);
    const requiredRoleIndex = roles.indexOf(requiredRole);
    return adminRoleIndex >= requiredRoleIndex;
  }
}

export const adminAuthService = new AdminAuthService();
