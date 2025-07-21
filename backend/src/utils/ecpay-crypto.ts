import crypto from "crypto"

/**
 * ECPay 加密解密工具
 */
export class ECPayCrypto {
  
  /**
   * AES-128-CBC 加密 (符合 ECPay 規範)
   * @param data 要加密的字串
   * @param key 加密金鑰 (16 bytes)
   * @param iv 初始向量 (16 bytes)
   * @returns 加密後的 Base64 字串
   */
  static encrypt(data: string, key: string, iv: string): string {
    try {
      console.log('🔐 ECPay 加密流程開始:')
      console.log('  - 原始資料:', data.substring(0, 100) + '...')
      console.log('  - Key長度:', key.length, '(需要16)')
      console.log('  - IV長度:', iv.length, '(需要16)')
      
      // 步驟 1: URL Encode 編碼
      const urlEncodedData = encodeURIComponent(data)
      console.log('  - URL編碼後長度:', urlEncodedData.length)
      console.log('  - URL編碼範例:', urlEncodedData.substring(0, 100) + '...')
      
      // 步驟 2: 確保 key 和 iv 長度正確
      const keyBuffer = Buffer.from(key.padEnd(16, '0').substring(0, 16))
      const ivBuffer = Buffer.from(iv.padEnd(16, '0').substring(0, 16))
      
      // 步驟 3: AES-128-CBC 加密 (PKCS7 padding 是 Node.js 預設)
      const cipher = crypto.createCipheriv('aes-128-cbc', keyBuffer, ivBuffer)
      let encrypted = cipher.update(urlEncodedData, 'utf8', 'base64')
      encrypted += cipher.final('base64')
      
      console.log('  - 加密成功，結果長度:', encrypted.length)
      console.log('  - 加密結果範例:', encrypted.substring(0, 50) + '...')
      
      return encrypted
    } catch (error) {
      console.error('❌ ECPay 加密失敗:', error)
      throw new Error(`ECPay 加密失敗: ${error.message}`)
    }
  }

  /**
   * AES-128-CBC 解密 (符合 ECPay 規範)
   * @param encryptedData 加密的 Base64 字串
   * @param key 解密金鑰 (16 bytes)
   * @param iv 初始向量 (16 bytes)
   * @returns 解密後的字串
   */
  static decrypt(encryptedData: string, key: string, iv: string): string {
    try {
      console.log('🔓 ECPay 解密流程開始:')
      console.log('  - 加密資料長度:', encryptedData.length)
      console.log('  - Key長度:', key.length, '(需要16)')
      console.log('  - IV長度:', iv.length, '(需要16)')
      
      // 步驟 1: 確保 key 和 iv 長度正確
      const keyBuffer = Buffer.from(key.padEnd(16, '0').substring(0, 16))
      const ivBuffer = Buffer.from(iv.padEnd(16, '0').substring(0, 16))
      
      // 步驟 2: AES-128-CBC 解密
      const decipher = crypto.createDecipheriv('aes-128-cbc', keyBuffer, ivBuffer)
      let decrypted = decipher.update(encryptedData, 'base64', 'utf8')
      decrypted += decipher.final('utf8')
      
      console.log('  - AES解密完成，長度:', decrypted.length)
      console.log('  - 解密範例:', decrypted.substring(0, 100) + '...')
      
      // 步驟 3: URL Decode 解碼
      const urlDecodedData = decodeURIComponent(decrypted)
      console.log('  - URL解碼完成，長度:', urlDecodedData.length)
      
      return urlDecodedData
    } catch (error) {
      console.error('❌ ECPay 解密失敗:', error)
      throw new Error(`ECPay 解密失敗: ${error.message}`)
    }
  }

  /**
   * 生成時間戳
   * @returns Unix 時間戳字串
   */
  static generateTimestamp(): string {
    const timestamp = Math.floor(Date.now() / 1000).toString()
    console.log('🕒 ECPayCrypto 產生時間戳:', timestamp, '( 對應時間:', new Date(parseInt(timestamp) * 1000).toLocaleString('zh-TW'), ')')
    return timestamp
  }

  /**
   * 驗證時間戳是否在有效範圍內 (5分鐘)
   * @param timestamp 時間戳字串
   * @returns 是否有效
   */
  static isTimestampValid(timestamp: string): boolean {
    const now = Math.floor(Date.now() / 1000)
    const ts = parseInt(timestamp)
    const diff = Math.abs(now - ts)
    return diff <= 300 // 5分鐘 = 300秒
  }

  /**
   * 產生檢查碼 (用於驗證資料完整性)
   * @param params 參數物件
   * @param hashKey Hash Key
   * @param hashIV Hash IV
   * @returns 檢查碼
   */
  static generateCheckMacValue(params: Record<string, any>, hashKey: string, hashIV: string): string {
    // 將參數排序並組成查詢字串
    const sortedKeys = Object.keys(params).sort()
    const queryString = sortedKeys
      .filter(key => params[key] !== '' && params[key] !== null && params[key] !== undefined)
      .map(key => `${key}=${params[key]}`)
      .join('&')
    
    // 加上 HashKey 和 HashIV
    const rawString = `HashKey=${hashKey}&${queryString}&HashIV=${hashIV}`
    
    // URL encode
    const encodedString = encodeURIComponent(rawString)
      .replace(/%20/g, '+')
      .replace(/[!'()*]/g, function(c) {
        return '%' + c.charCodeAt(0).toString(16).toUpperCase()
      })
    
    // 轉小寫並計算 SHA256
    const lowerString = encodedString.toLowerCase()
    const hash = crypto.createHash('sha256').update(lowerString).digest('hex')
    
    return hash.toUpperCase()
  }
}

/**
 * ECPay 物流相關常數
 */
export const ECPayConstants = {
  // API 網址
  URLS: {
    LOGISTICS_SELECTION_STAGE: 'https://logistics-stage.ecpay.com.tw/Express/v2/RedirectToLogisticsSelection',
    LOGISTICS_SELECTION_PROD: 'https://logistics.ecpay.com.tw/Express/v2/RedirectToLogisticsSelection'
  },

  // 溫層
  TEMPERATURE: {
    NORMAL: '0001',    // 常溫
    REFRIGERATED: '0002', // 冷藏
    FROZEN: '0003'     // 冷凍
  },

  // 規格
  SPECIFICATION: {
    SIZE_60: '0001',   // 60cm
    SIZE_90: '0002',   // 90cm
    SIZE_120: '0003',  // 120cm
    SIZE_150: '0004'   // 150cm
  },

  // 取件時段
  PICKUP_TIME: {
    MORNING: '1',      // 9~12
    AFTERNOON: '2',    // 12~17
    ANYTIME: '4'       // 不限時
  },

  // 送達時段
  DELIVERY_TIME: {
    BEFORE_13: '1',    // 13前
    AFTERNOON: '2',    // 14~18
    ANYTIME: '4'       // 不限時
  },

  // 物流類型
  LOGISTICS_TYPE: {
    CVS: 'CVS',        // 超商
    HOME: 'HOME'       // 宅配
  },

  // 物流子類型
  LOGISTICS_SUB_TYPE: {
    // 7-ELEVEN
    UNIMART_C2C: 'UNIMARTC2C',
    UNIMART_FREEZE: 'UNIMARTFREEZE',
    
    // 全家
    FAMI_C2C: 'FAMIC2C',
    FAMI_FREEZE: 'FAMIFREEZE',
    
    // 萊爾富
    HILIFE_C2C: 'HILIFEC2C',
    
    // OK超商
    OKMART_C2C: 'OKMARTC2C',
    
    // 宅配
    TCAT: 'TCAT',
    ECAN: 'ECAN'
  }
}

/**
 * 物流選擇參數驗證器
 */
export class LogisticsValidator {
  
  /**
   * 驗證商品金額
   */
  static validateGoodsAmount(amount: number): boolean {
    return amount >= 1 && amount <= 20000
  }

  /**
   * 驗證商品名稱
   */
  static validateGoodsName(name: string): boolean {
    if (!name || name.length > 50) return false
    
    // 檢查禁用字元
    const forbiddenChars = /[\^'`!@#%&*+\\"<>|_\[\]]/
    return !forbiddenChars.test(name)
  }

  /**
   * 驗證姓名
   */
  static validateName(name: string): boolean {
    if (!name || name.length < 4 || name.length > 10) return false
    
    // 不可包含數字和特殊符號
    const invalidChars = /[0-9\^'`!@#%&*+\\"<>|_\[\]()]/
    return !invalidChars.test(name)
  }

  /**
   * 驗證手機號碼
   */
  static validateCellPhone(phone: string): boolean {
    if (!phone) return true // 可選欄位
    
    // 必須是 09 開頭的 10 位數字
    const phonePattern = /^09\d{8}$/
    return phonePattern.test(phone)
  }

  /**
   * 驗證郵遞區號
   */
  static validateZipCode(zipCode: string): boolean {
    if (!zipCode || zipCode.length > 6) return false
    
    // 只能包含數字
    const zipPattern = /^\d+$/
    return zipPattern.test(zipCode)
  }

  /**
   * 驗證溫層和規格組合
   */
  static validateTemperatureSpecification(temperature: string, specification: string): boolean {
    // 冷藏或冷凍時不可選擇 150cm
    if ((temperature === ECPayConstants.TEMPERATURE.REFRIGERATED || 
         temperature === ECPayConstants.TEMPERATURE.FROZEN) && 
        specification === ECPayConstants.SPECIFICATION.SIZE_150) {
      return false
    }
    return true
  }
}
