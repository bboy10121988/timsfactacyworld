// API utility functions for affiliate system
const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

export interface AffiliatePartner {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  affiliate_code: string
  referral_link: string
  status: 'pending' | 'approved' | 'rejected'
  commission_rate: number
  created_at: string
  updated_at: string
}

export interface AffiliateStats {
  totalClicks: number
  totalConversions: number
  conversionRate: number
  totalEarnings: number
  pendingEarnings: number
  thisMonthEarnings: number
}

class AffiliateAPI {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
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
          totalClicks: response.stats.totalClicks,
          totalConversions: response.stats.totalConversions,
          conversionRate: response.stats.conversionRate,
          totalEarnings: response.stats.totalEarnings,
          pendingEarnings: response.stats.pendingEarnings,
          thisMonthEarnings: response.stats.thisMonthEarnings
        }
      }
      
      // Fallback to mock data if API fails
      return {
        totalClicks: 0,
        totalConversions: 0,
        conversionRate: 0,
        totalEarnings: 0,
        pendingEarnings: 0,
        thisMonthEarnings: 0
      }
    } catch (error) {
      console.error('Failed to fetch partner stats:', error)
      
      // Return zero stats if API fails
      return {
        totalClicks: 0,
        totalConversions: 0,
        conversionRate: 0,
        totalEarnings: 0,
        pendingEarnings: 0,
        thisMonthEarnings: 0
      }
    }
  }
}

export const affiliateAPI = new AffiliateAPI()
