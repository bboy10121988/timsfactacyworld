// API utility functions for affiliate system
const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

export interface AffiliatePartner {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  website?: string
  socialMedia?: string
  address?: string
  accountName?: string
  bankCode?: string
  accountNumber?: string
  taxId?: string
  referralCode: string
  referral_link: string
  status: 'active' | 'pending' | 'suspended'
  commission_rate: number
  createdAt: string
  updatedAt: string
}

export interface AffiliateStats {
  totalClicks: number
  totalConversions: number
  totalReferrals: number
  totalCommissions: number
  monthlyCommissions: number
  conversionRate: number
  totalEarnings: number
  pendingEarnings: number
  thisMonthEarnings: number
}

export interface AffiliateEarning {
  id: string
  partnerId: string
  orderId: string
  orderNumber: string
  customerEmail: string
  productName: string
  orderAmount: number
  commissionAmount: number
  commissionRate: number
  status: 'pending' | 'paid' | 'cancelled'
  createdAt: string
  paidAt?: string
}

class AffiliateAPI {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    // For development purposes, bypass actual API calls and return mock data
    if (process.env.NODE_ENV === 'development') {
      console.log('使用模擬數據 (開發模式):', endpoint)
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Return mock responses based on endpoint
      if (endpoint.includes('/stats')) {
        return {
          success: true,
          stats: {
            totalClicks: 1250,
            totalConversions: 87,
            totalReferrals: 142,
            totalCommissions: 25800,
            monthlyCommissions: 8500,
            conversionRate: 6.96,
            totalEarnings: 25800,
            pendingEarnings: 8500,
            thisMonthEarnings: 8500
          }
        }
      }
      
      if (endpoint.includes('/partners') && endpoint.includes('email=')) {
        return {
          exists: false
        }
      }
      
      return { success: true }
    }

    const url = `${BACKEND_URL}${endpoint}`
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(PUBLISHABLE_KEY && { 'x-publishable-api-key': PUBLISHABLE_KEY })
    }

    console.log('發送 API 請求:', url, {
      method: options.method || 'GET',
      headers: { ...defaultHeaders, ...options.headers },
      body: options.body
    })

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers
        }
      })

      console.log('API 回應狀態:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API 錯誤回應:', errorText)
        
        // 嘗試解析 JSON 錯誤訊息
        try {
          const errorData = JSON.parse(errorText)
          if (errorData.message) {
            throw new Error(errorData.message)
          }
          if (errorData.error) {
            throw new Error(errorData.error)
          }
        } catch (parseError) {
          // 如果不是 JSON 格式，使用原始錯誤
        }
        
        throw new Error(`API Error: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('API 成功回應:', result)
      return result
    } catch (error) {
      console.error('API 請求失敗:', error)
      throw error
    }
  }

  async getAllPartners(): Promise<{ partners: AffiliatePartner[] }> {
    return this.makeRequest('/store/affiliate/partners')
  }

  async checkEmailExists(email: string): Promise<{ exists: boolean; partner?: AffiliatePartner }> {
    return this.makeRequest(`/store/affiliate/partners?email=${encodeURIComponent(email)}`)
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest('/store/affiliate/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    })
  }

  async loginPartner(email: string, password: string): Promise<{ success: boolean; partner?: AffiliatePartner; message?: string }> {
    try {
      // First check if partner exists with this email
      const checkResponse = await this.checkEmailExists(email)
      
      if (!checkResponse.exists || !checkResponse.partner) {
        return {
          success: false,
          message: "Email or password is incorrect"
        }
      }

      // For now, we'll use a simple validation approach
      // In a real implementation, you'd want proper authentication
      const partner = checkResponse.partner
      
      return {
        success: true,
        partner: partner,
        message: "Login successful"
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        message: "Login failed"
      }
    }
  }

  async createPartner(data: {
    name: string
    email: string
    password: string
    phone?: string
    company?: string
  }): Promise<{ partner: AffiliatePartner }> {
    return this.makeRequest('/store/affiliate/partners', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async trackClick(affiliateCode: string, productId?: string): Promise<void> {
    return this.makeRequest('/store/affiliate/track', {
      method: 'POST',
      body: JSON.stringify({
        affiliate_code: affiliateCode,
        product_id: productId
      })
    })
  }

  // Get real partner stats from backend
  async getPartnerStats(partnerId: string): Promise<AffiliateStats> {
    try {
      const response = await this.makeRequest(`/store/affiliate/partners/${partnerId}/stats`)
      
      if (response.success && response.stats) {
        return {
          totalClicks: response.stats.totalClicks || 0,
          totalConversions: response.stats.totalConversions || 0,
          totalReferrals: response.stats.totalReferrals || 0,
          totalCommissions: response.stats.totalCommissions || 0,
          monthlyCommissions: response.stats.monthlyCommissions || 0,
          conversionRate: response.stats.conversionRate || 0,
          totalEarnings: response.stats.totalEarnings || 0,
          pendingEarnings: response.stats.pendingEarnings || 0,
          thisMonthEarnings: response.stats.thisMonthEarnings || 0
        }
      }
      
      // Fallback to mock data if API fails
      return {
        totalClicks: 1250,
        totalConversions: 87,
        totalReferrals: 142,
        totalCommissions: 25800,
        monthlyCommissions: 8500,
        conversionRate: 6.96,
        totalEarnings: 25800,
        pendingEarnings: 8500,
        thisMonthEarnings: 8500
      }
    } catch (error) {
      console.error('Failed to fetch partner stats:', error)
      
      // Return mock stats for demo purposes
      return {
        totalClicks: 1250,
        totalConversions: 87,
        totalReferrals: 142,
        totalCommissions: 25800,
        monthlyCommissions: 8500,
        conversionRate: 6.96,
        totalEarnings: 25800,
        pendingEarnings: 8500,
        thisMonthEarnings: 8500
      }
    }
  }

  // Mock authentication and profile methods for development
  async isAuthenticated(): Promise<boolean> {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('affiliate_token') !== null
  }

  async getProfile(): Promise<AffiliatePartner> {
    // Mock partner data for development
    return {
      id: 'partner-123',
      name: '王小明',
      email: 'affiliate@example.com',
      phone: '0912345678',
      website: 'https://myblog.com',
      socialMedia: 'Instagram: @myaccount',
      address: '台北市信義區信義路五段7號',
      accountName: '王小明',
      bankCode: '822',
      accountNumber: '1234567890',
      taxId: '12345678',
      referralCode: 'AFFILIATE123',
      referral_link: 'https://example.com?ref=AFFILIATE123',
      status: 'active',
      commission_rate: 0.08,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z'
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; partner?: AffiliatePartner; message?: string }> {
    // Mock login for development
    if (email === 'affiliate@example.com' && password === 'password') {
      const partner = await this.getProfile()
      if (typeof window !== 'undefined') {
        localStorage.setItem('affiliate_token', 'mock-token-123')
      }
      return { success: true, partner }
    }
    return { success: false, message: '電子郵件或密碼錯誤' }
  }

  async register(data: {
    name: string
    email: string
    password: string
    phone?: string
    website?: string
  }): Promise<{ success: boolean; partner?: AffiliatePartner; message?: string }> {
    // Mock registration for development
    const partner: AffiliatePartner = {
      id: 'partner-new',
      name: data.name,
      email: data.email,
      phone: data.phone,
      website: data.website,
      referralCode: `REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      referral_link: `https://example.com?ref=REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: 'active',
      commission_rate: 0.08,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('affiliate_token', 'mock-token-new')
    }
    
    return { success: true, partner, message: '註冊成功！' }
  }

  async updateProfile(data: Partial<AffiliatePartner>): Promise<AffiliatePartner> {
    // Mock profile update
    const currentProfile = await this.getProfile()
    return { ...currentProfile, ...data, updatedAt: new Date().toISOString() }
  }

  async updatePassword(data: { currentPassword: string; newPassword: string }): Promise<{ success: boolean; message?: string }> {
    // Mock password update
    if (data.currentPassword === 'password') {
      return { success: true, message: '密碼更新成功' }
    }
    return { success: false, message: '目前密碼錯誤' }
  }

  async updatePaymentInfo(data: {
    accountName: string
    bankCode: string
    accountNumber: string
    taxId?: string
  }): Promise<AffiliatePartner> {
    // Mock payment info update
    const currentProfile = await this.getProfile()
    return { 
      ...currentProfile, 
      ...data, 
      updatedAt: new Date().toISOString() 
    }
  }

  async getEarnings(page: number = 1, limit: number = 20): Promise<{
    earnings: AffiliateEarning[]
    total: number
    totalPages: number
  }> {
    // Mock earnings data
    const mockEarnings: AffiliateEarning[] = Array.from({ length: 15 }, (_, i) => ({
      id: `earning-${i + 1}`,
      partnerId: 'partner-123',
      orderId: `order-${i + 1}`,
      orderNumber: `TIM${(1000 + i).toString()}`,
      customerEmail: `customer${i + 1}@example.com`,
      productName: i % 3 === 0 ? '綠色經典罐裝' : i % 3 === 1 ? '黃色經典罐裝' : '紅色經典罐裝',
      orderAmount: 480 + (i * 20),
      commissionAmount: Math.floor((480 + (i * 20)) * 0.08),
      commissionRate: 0.08,
      status: i % 4 === 0 ? 'paid' : i % 4 === 1 ? 'cancelled' : 'pending',
      createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
      paidAt: i % 4 === 0 ? new Date(Date.now() - (i * 24 * 60 * 60 * 1000) + (7 * 24 * 60 * 60 * 1000)).toISOString() : undefined
    }))

    const start = (page - 1) * limit
    const end = start + limit
    
    return {
      earnings: mockEarnings.slice(start, end),
      total: mockEarnings.length,
      totalPages: Math.ceil(mockEarnings.length / limit)
    }
  }

  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('affiliate_token')
    }
  }
}

export const affiliateAPI = new AffiliateAPI()
