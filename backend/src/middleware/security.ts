import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { body, query, param, validationResult } from "express-validator";
import jwt from "jsonwebtoken";

// Rate limiting 配置
export const createRateLimit = (windowMs: number = 15 * 60 * 1000, max: number = 100) => {
  return rateLimit({
    windowMs, // 時間窗口
    max, // 最大請求數
    message: {
      error: "請求過於頻繁，請稍後再試",
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// 通用 Rate Limits
export const generalRateLimit = createRateLimit(15 * 60 * 1000, 100); // 15分鐘100次
export const authRateLimit = createRateLimit(15 * 60 * 1000, 10); // 15分鐘10次登入
export const apiRateLimit = createRateLimit(1 * 60 * 1000, 30); // 1分鐘30次API

// Helmet 安全設定
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https:"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Medusa 需要
});

// JWT 驗證中介軟體（兼容 Medusa 認證）
export const verifyAdminToken = (req: Request, res: Response, next: NextFunction) => {
  console.log('🔍 verifyAdminToken middleware triggered');
  console.log('📋 Headers:', req.headers.authorization);
  
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('❌ No Bearer token found');
      return res.status(401).json({
        success: false,
        error: "未提供有效的認證令牌"
      });
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || "your-super-secret-key-change-in-production";
    
    console.log('🔑 Verifying token with secret:', jwtSecret.substring(0, 10) + '...');
    
    const decoded = jwt.verify(token, jwtSecret) as any;
    console.log('✅ Token decoded:', JSON.stringify(decoded, null, 2));
    
    // 兼容 Medusa 的 JWT 格式和我們自定義的格式
    const isMedusaToken = decoded.actor_type === 'user' && decoded.auth_identity_id;
    const isCustomAdminToken = decoded.role === 'admin' || decoded.adminRole;
    
    console.log('🔍 Token validation:');
    console.log('  - Is Medusa token:', isMedusaToken);
    console.log('  - Is custom admin token:', isCustomAdminToken);
    
    if (!isMedusaToken && !isCustomAdminToken) {
      console.log('❌ Token validation failed - insufficient permissions');
      return res.status(403).json({
        success: false,
        error: "需要管理員權限"
      });
    }

    console.log('✅ Token validated successfully');
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Token verification error:', error);
    return res.status(401).json({
      success: false,
      error: "無效的認證令牌"
    });
  }
};

// 夥伴 JWT 驗證
export const verifyPartnerToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: "未提供有效的認證令牌"
      });
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || "your-super-secret-key-change-in-production";
    
    const decoded = jwt.verify(token, jwtSecret) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "無效的認證令牌"
    });
  }
};

// 輸入驗證規則
export const validateCreatePartner = [
  body('name').isLength({ min: 2, max: 100 }).withMessage('夥伴名稱必須為2-100字符'),
  body('email').isEmail().withMessage('請提供有效的電子郵件地址'),
  body('phone').optional().isMobilePhone('any').withMessage('請提供有效的手機號碼'),
  body('website').optional().isURL().withMessage('請提供有效的網站URL'),
  body('password').isLength({ min: 6 }).withMessage('密碼至少需要6個字符'),
];

export const validateLogin = [
  body('email').isEmail().withMessage('請提供有效的電子郵件地址'),
  body('password').notEmpty().withMessage('請提供密碼'),
];

export const validateTrackClick = [
  body('partnerId').isUUID().withMessage('無效的夥伴ID'),
  body('productId').isString().isLength({ min: 1, max: 255 }).withMessage('產品ID無效'),
  body('url').isURL().withMessage('請提供有效的URL'),
];

export const validateConversion = [
  body('partnerId').isUUID().withMessage('無效的夥伴ID'),
  body('orderId').isString().isLength({ min: 1, max: 255 }).withMessage('訂單ID無效'),
  body('productId').isString().isLength({ min: 1, max: 255 }).withMessage('產品ID無效'),
  body('orderValue').isFloat({ min: 0 }).withMessage('訂單金額必須大於等於0'),
  body('commissionRate').isFloat({ min: 0, max: 1 }).withMessage('佣金率必須在0-1之間'),
];

export const validateApprovePartner = [
  body('partnerId').isUUID().withMessage('無效的夥伴ID'),
  body('status').isIn(['approved', 'rejected']).withMessage('狀態必須是approved或rejected'),
  body('reason').optional().isString().isLength({ max: 500 }).withMessage('原因不能超過500字符'),
];

export const validateUpdateCommission = [
  body('conversionId').isUUID().withMessage('無效的轉換ID'),
  body('newStatus').isIn(['pending', 'approved', 'rejected', 'paid']).withMessage('無效的狀態'),
  body('updateReason').optional().isString().isLength({ max: 500 }).withMessage('原因不能超過500字符'),
];

export const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('頁碼必須大於0'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每頁數量必須在1-100之間'),
];

export const validatePartnerId = [
  param('id').isUUID().withMessage('無效的夥伴ID'),
];

// 驗證結果檢查中介軟體
export const checkValidationResult = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: "輸入驗證失敗",
      details: errors.array()
    });
  }
  next();
};

// 錯誤處理中介軟體
export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', error);
  
  // JWT 錯誤
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: "無效的認證令牌"
    });
  }
  
  // 驗證錯誤
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: "資料驗證失敗",
      details: error.message
    });
  }
  
  // 預設錯誤
  res.status(500).json({
    success: false,
    error: "服務器內部錯誤"
  });
};

// CORS 配置
export const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourapp.com', 'https://admin.yourapp.com']
    : ['http://localhost:3000', 'http://localhost:8000', 'http://localhost:9000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// 請求日誌中介軟體
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, url, ip } = req;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    console.log(`${new Date().toISOString()} ${method} ${url} ${statusCode} ${duration}ms ${ip}`);
  });
  
  next();
};
