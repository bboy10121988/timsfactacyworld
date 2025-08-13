// Admin API utility functions for affiliate management system
const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'

export interface AdminPartner {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  website?: string
  referralCode: string
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  commissionRate: number
  totalEarnings: number
  createdAt: string
  updatedAt: string
}

export interface AdminCommission {
  id: string
  partnerId: string
  partnerName: string
  orderId: string
  orderNumber: string
  amount: number
  commissionRate: number
  status: 'pending' | 'confirmed' | 'paid' | 'cancelled'
  createdAt: string
  paidAt?: string
}

export interface AdminStats {
  partners: {
    total: number
    pending: number
    approved: number
    rejected: number
    suspended: number
  }
  performance: {
    totalClicks: number
    totalConversions: number
    totalCommissions: number
    monthlyConversions: number
    monthlyCommissions: number
    conversionRate: number
  }
}

export interface BatchResult {
  id: string
  success: boolean
  error?: string
}

export interface BatchResponse {
  success: boolean
  data: {
    action: string
    target: string
    total: number
    successful: number
    failed: number
    results: BatchResult[]
  }
}

class AdminAPI {
  private adminToken: string | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.adminToken = localStorage.getItem('admin_token')
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${BACKEND_URL}${endpoint}`
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(this.adminToken && { 'Authorization': `Bearer ${this.adminToken}` })
    }

    console.log('發送管理員 API 請求:', url, {
      method: options.method || 'GET',
      headers: { ...defaultHeaders, ...options.headers }
    })

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers
        }
      })

      console.log('管理員 API 回應狀態:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('管理員 API 錯誤:', errorText)
        throw new Error(`API Error: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('管理員 API 成功回應:', result)
      return result
    } catch (error) {
      console.error('管理員 API 請求失敗:', error)
      throw error
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<{ success: boolean; token?: string; message?: string }> {
    try {
      const response = await this.makeRequest('/admin-auth', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })

      if (response.success && response.data?.token) {
        this.adminToken = response.data.token
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_token', response.data.token)
        }
        return { success: true, token: response.data.token }
      }

      return { success: false, message: response.message || '登入失敗' }
    } catch (error) {
      console.error('Admin login error:', error)
      return { success: false, message: '登入過程中發生錯誤' }
    }
  }

  logout() {
    this.adminToken = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token')
    }
  }

  isAuthenticated(): boolean {
    return !!this.adminToken
  }

  // Partners Management
  async getPartners(params: {
    page?: number
    limit?: number
    status?: 'pending' | 'approved' | 'rejected' | 'suspended'
  } = {}): Promise<{ success: boolean; data: { items: AdminPartner[]; total: number; page: number; totalPages: number } }> {
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.status) queryParams.append('status', params.status)

    return this.makeRequest(`/admin/affiliate/partners?${queryParams.toString()}`)
  }

  async getPartner(id: string): Promise<{ success: boolean; data: AdminPartner }> {
    return this.makeRequest(`/admin/affiliate/partners/${id}`)
  }

  async approvePartner(id: string, action: 'approve' | 'reject' | 'suspend', reason?: string): Promise<{ success: boolean; message?: string }> {
    return this.makeRequest(`/admin/affiliate/partners/${id}`, {
      method: 'POST',
      body: JSON.stringify({ action, reason })
    })
  }

  // Commissions Management
  async getCommissions(params: {
    page?: number
    limit?: number
    status?: 'pending' | 'confirmed' | 'paid' | 'cancelled'
    partnerId?: string
  } = {}): Promise<{ success: boolean; data: { items: AdminCommission[]; total: number; page: number; totalPages: number } }> {
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.status) queryParams.append('status', params.status)
    if (params.partnerId) queryParams.append('partner_id', params.partnerId)

    return this.makeRequest(`/admin/affiliate/commissions?${queryParams.toString()}`)
  }

  async updateCommissionStatus(
    id: string, 
    status: 'confirmed' | 'paid' | 'cancelled', 
    reason?: string
  ): Promise<{ success: boolean; message?: string }> {
    return this.makeRequest(`/admin/affiliate/commissions/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, reason })
    })
  }

  // Statistics
  async getStats(): Promise<{ success: boolean; data: AdminStats }> {
    return this.makeRequest('/admin/affiliate/stats')
  }

  // Batch Operations
  async batchOperation(
    action: 'approve' | 'reject' | 'suspend' | 'pay' | 'cancel',
    target: 'partners' | 'commissions',
    ids: string[],
    reason?: string
  ): Promise<BatchResponse> {
    return this.makeRequest('/admin/affiliate/batch', {
      method: 'POST',
      body: JSON.stringify({
        action,
        target,
        ids,
        data: { reason }
      })
    })
  }

  // Data Export
  async exportData(
    type: 'partners' | 'commissions' | 'payments',
    format: 'json' | 'csv' = 'json',
    filters?: {
      dateFrom?: string
      dateTo?: string
      status?: string
    }
  ): Promise<any> {
    const queryParams = new URLSearchParams()
    queryParams.append('type', type)
    queryParams.append('format', format)
    if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom)
    if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo)
    if (filters?.status) queryParams.append('status', filters.status)

    const response = await fetch(`${BACKEND_URL}/admin/affiliate/export?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${this.adminToken}`
      }
    })

    if (format === 'csv') {
      const blob = await response.blob()
      return blob
    }

    return response.json()
  }

  // Test basic functionality (using the test endpoint we created)
  async testConnection(): Promise<{ success: boolean; data?: any }> {
    return this.makeRequest('/affiliate-test')
  }
}

export const adminAPI = new AdminAPI()
export default adminAPI
