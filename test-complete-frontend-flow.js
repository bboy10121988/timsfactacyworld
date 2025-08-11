// 測試完整的前端 affiliate API 流程
const BACKEND_URL = 'http://localhost:9000'
const PUBLISHABLE_KEY = 'sk_9fedcb4c350478cacf19a37ca3af9aec'

// 模擬瀏覽器環境中的 localStorage
const mockLocalStorage = {
  storage: {},
  setItem: function(key, value) {
    this.storage[key] = value || ''
    console.log(`💾 localStorage.setItem('${key}', '${value}')`)
  },
  getItem: function(key) {
    const value = this.storage[key] || null
    console.log(`📖 localStorage.getItem('${key}') = ${value}`)
    return value
  },
  removeItem: function(key) {
    delete this.storage[key]
    console.log(`🗑️ localStorage.removeItem('${key}')`)
  }
}

// 設置全域 window 和 localStorage
global.window = { localStorage: mockLocalStorage }

// 引入前端 API 邏輯（簡化版本）
class TestAffiliateAPI {
  async makeRequest(endpoint, options = {}) {
    const url = `${BACKEND_URL}${endpoint}`
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'x-publishable-api-key': PUBLISHABLE_KEY
    }

    console.log('🌐 發送 API 請求:', url)
    console.log('📋 請求選項:', { method: options.method || 'GET', body: options.body })

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers
        }
      })

      console.log('✅ API 回應狀態:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API 錯誤回應:', errorText)
        throw new Error(`API Error: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('📦 API 成功回應:', result)
      return result
    } catch (error) {
      console.error('💥 API 請求失敗:', error)
      throw error
    }
  }

  async loginPartner(email, password) {
    try {
      const response = await this.makeRequest('/store/affiliate/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })

      if (response.success && response.partner) {
        // 轉換後端資料格式為前端介面格式
        const transformedPartner = {
          id: response.partner.id,
          name: response.partner.name,
          email: response.partner.email,
          phone: response.partner.phone,
          website: response.partner.website,
          referralCode: response.partner.uniqueCode || response.partner.referralCode,
          referral_link: `https://timsfantasyworld.com/tw?ref=${response.partner.uniqueCode || response.partner.referralCode}`,
          status: response.partner.status === 'approved' ? 'active' : response.partner.status,
          commission_rate: response.partner.commissionRate || response.partner.commission_rate || 0.05,
          createdAt: response.partner.createdAt,
          updatedAt: response.partner.updatedAt
        }

        return {
          success: true,
          partner: transformedPartner,
          message: response.message || "Login successful"
        }
      } else {
        return {
          success: false,
          message: response.message || "Login failed"
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        message: error.message || "Login failed"
      }
    }
  }

  async login(email, password) {
    console.log('🔐 開始登入流程...')
    
    try {
      const response = await this.loginPartner(email, password)
      
      if (response.success && response.partner) {
        // 儲存 token 和 partner 資料到 localStorage
        if (typeof window !== 'undefined') {
          mockLocalStorage.setItem('affiliate_token', 'token-' + response.partner.id)
          mockLocalStorage.setItem('affiliate_partner', JSON.stringify(response.partner))
        }
        
        console.log('✅ 登入成功！合作夥伴資料已保存')
        return { 
          success: true, 
          partner: response.partner, 
          message: response.message || '登入成功！' 
        }
      } else {
        console.log('❌ 登入失敗:', response.message)
        return { 
          success: false, 
          message: response.message || '電子郵件或密碼錯誤' 
        }
      }
    } catch (error) {
      console.error('💥 登入錯誤:', error)
      return { 
        success: false, 
        message: error.message || '登入過程中發生錯誤' 
      }
    }
  }

  async getProfile() {
    console.log('👤 開始獲取 profile...')
    
    if (typeof window === 'undefined') {
      throw new Error('無法在服務器端獲取 profile')
    }
    
    const token = mockLocalStorage.getItem('affiliate_token')
    const partnerData = mockLocalStorage.getItem('affiliate_partner')
    
    if (!token) {
      throw new Error('未找到認證 token')
    }
    
    if (partnerData) {
      try {
        const partner = JSON.parse(partnerData)
        console.log('✅ 從 localStorage 獲取 profile 成功')
        return partner
      } catch (error) {
        console.error('❌ 解析 partner 資料失敗:', error)
      }
    }
    
    throw new Error('找不到合作夥伴資料，請重新登入')
  }

  async isAuthenticated() {
    console.log('🔍 檢查認證狀態...')
    
    if (typeof window === 'undefined') return false
    const token = mockLocalStorage.getItem('affiliate_token')
    if (!token) return false
    
    try {
      // 嘗試獲取 profile 來驗證 token 是否有效
      await this.getProfile()
      console.log('✅ 用戶已認證')
      return true
    } catch (error) {
      // Token 無效，清除它
      mockLocalStorage.removeItem('affiliate_token')
      mockLocalStorage.removeItem('affiliate_partner')
      console.log('❌ 認證無效，已清除 token')
      return false
    }
  }
}

async function testCompleteFlow() {
  console.log('🚀 === 開始完整前端流程測試 ===\n')
  
  const api = new TestAffiliateAPI()
  
  // 1. 檢查初始認證狀態
  console.log('📋 步驟 1: 檢查初始認證狀態')
  const initialAuth = await api.isAuthenticated()
  console.log('初始認證狀態:', initialAuth)
  console.log()
  
  // 2. 執行登入
  console.log('📋 步驟 2: 執行登入')
  const loginResult = await api.login('testuser2024@example.com', 'Test123456!')
  console.log('登入結果:', loginResult.success ? '成功' : '失敗')
  if (loginResult.partner) {
    console.log('合作夥伴資料:', {
      id: loginResult.partner.id,
      name: loginResult.partner.name,
      email: loginResult.partner.email,
      referralCode: loginResult.partner.referralCode,
      status: loginResult.partner.status
    })
  }
  console.log()
  
  // 3. 檢查登入後的認證狀態
  console.log('📋 步驟 3: 檢查登入後的認證狀態')
  const authAfterLogin = await api.isAuthenticated()
  console.log('登入後認證狀態:', authAfterLogin)
  console.log()
  
  // 4. 獲取 profile
  console.log('📋 步驟 4: 獲取 profile')
  try {
    const profile = await api.getProfile()
    console.log('Profile 資料:', {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      referralCode: profile.referralCode,
      referral_link: profile.referral_link
    })
  } catch (error) {
    console.error('獲取 profile 失敗:', error.message)
  }
  
  console.log('\n🎉 === 前端流程測試完成 ===')
}

// 執行測試
testCompleteFlow().catch(console.error)
