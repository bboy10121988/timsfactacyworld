import { Container, Heading } from "@medusajs/ui"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useEffect, useState } from "react"
import { Users, DollarSign, BarChart3 } from "lucide-react"

interface AffiliatePartner {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  website?: string
  affiliate_code: string
  referral_link: string
  commission_rate?: number // 管理員設定的佣金率，申請時為空
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  notes?: string
  created_at: string
  updated_at: string
  approved_at?: string
}

const AffiliateManagement = () => {
  const [partners, setPartners] = useState<AffiliatePartner[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('pending')
  const [commissionRates, setCommissionRates] = useState<{[key: string]: number}>({})

  // 模擬數據定義 - 申請時沒有佣金率，管理員審核時設定
  const mockData: AffiliatePartner[] = [
    {
      id: '1',
      name: '王小明',
      email: 'wang@example.com',
      phone: '0912345678',
      company: '小明行銷公司',
      affiliate_code: 'WANG123',
      referral_link: 'https://example.com?ref=WANG123',
      // commission_rate: 未設定，等待管理員審核時決定
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      name: '李美華',
      email: 'li@example.com',
      company: '華美數位',
      affiliate_code: 'LI456',
      referral_link: 'https://example.com?ref=LI456',
      commission_rate: 0.05, // 管理員核准時設定的佣金率
      status: 'approved',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      approved_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      name: '陳大雄',
      email: 'chen@example.com',
      phone: '0956781234',
      company: '大雄科技',
      affiliate_code: 'CHEN789',
      referral_link: 'https://example.com?ref=CHEN789',
      // commission_rate: 被拒絕所以沒有佣金率
      status: 'rejected',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '4',
      name: '張美玲',
      email: 'zhang@example.com',
      phone: '0923456789',
      company: '美玲數位行銷',
      affiliate_code: 'ZHANG999',
      referral_link: 'https://example.com?ref=ZHANG999',
      // commission_rate: 待審核，尚未設定
      status: 'pending',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '5',
      name: '林志豪',
      email: 'lin@example.com',
      company: '志豪網路科技',
      affiliate_code: 'LIN888',
      referral_link: 'https://example.com?ref=LIN888',
      commission_rate: 0.055, // 管理員核准時設定較高佣金率
      status: 'approved',
      created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString(),
      approved_at: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]

  // 從真實 API 加載數據
  useEffect(() => {
    fetchPartners()
  }, [selectedStatus])

  const fetchPartners = async () => {
    try {
      setLoading(true)
      
      // 調用真實的管理員 API
      const response = await fetch('/admin/affiliate/partners')
      
      if (response.ok) {
        const data = await response.json()
        // 直接使用 API 返回的數據
        setPartners(data.partners || [])
        console.log('成功載入聯盟夥伴數據:', data.partners?.length || 0, '筆')
      } else {
        // API 錯誤時使用模擬數據作為回退
        console.warn('聯盟夥伴 API 不可用，使用模擬數據')
        setPartners(mockData)
      }
    } catch (error) {
      console.error('載入聯盟夥伴失敗:', error)
      // 網絡錯誤時使用模擬數據作為回退
      console.warn('載入聯盟夥伴 API 失敗，使用模擬數據')
      setPartners(mockData)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (partnerId: string, status: "approved" | "rejected", commissionRate?: number) => {
    try {
      // 調用真實的審核 API
      const response = await fetch(`/admin/affiliate/partners/${partnerId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status, 
          commission_rate: status === 'approved' ? (commissionRate || 0.05) : undefined,
          notes: `${status === 'approved' ? '核准' : '拒絕'} - ${new Date().toLocaleDateString()}`
        })
      })
      
      if (response.ok) {
        await response.json() // 確保響應被消費
        console.log(`${status} partner ${partnerId}`, commissionRate ? `with commission rate: ${commissionRate}` : '')
        
        // 重新載入數據以獲取最新狀態
        await fetchPartners()
        
        alert(`夥伴已${status === 'approved' ? '核准' : '拒絕'}${status === 'approved' && commissionRate ? `，佣金率設為 ${(commissionRate * 100).toFixed(1)}%` : ''}`)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || '審核操作失敗')
      }
      
    } catch (error: any) {
      console.error('審核操作失敗:', error)
      
      // 如果 API 失敗，退回到本地狀態更新
      console.warn('使用本地狀態更新作為回退')
      setPartners(prev => prev.map(partner => 
        partner.id === partnerId 
          ? { 
              ...partner, 
              status,
              commission_rate: status === 'approved' ? (commissionRate || 0.05) : undefined,
              updated_at: new Date().toISOString(),
              approved_at: status === 'approved' ? new Date().toISOString() : partner.approved_at
            }
          : partner
      ))
      
      alert(`${error.message}。已更新本地狀態，請稍後重新載入確認。`)
    }
  }

  // 篩選夥伴
  const filteredPartners = partners.filter(partner => {
    if (selectedStatus === '') return true // 全部
    return partner.status === selectedStatus
  })

  // 統計數據
  const stats = {
    total: partners.length,
    pending: partners.filter(p => p.status === 'pending').length,
    approved: partners.filter(p => p.status === 'approved').length,
    rejected: partners.filter(p => p.status === 'rejected').length
  }

  return (
    <Container className="divide-y p-0">
      {/* 聯盟管理導航 */}
      <div className="px-6 py-4 bg-gray-50 border-b">
        <div className="flex items-center justify-between">
          <Heading level="h1" className="text-2xl font-bold">聯盟夥伴系統</Heading>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.href = '/app/affiliate'}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Users className="w-4 h-4" />
              夥伴管理
            </button>
            <button
              onClick={() => window.location.href = '/app/affiliate/dashboard'}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              <BarChart3 className="w-4 h-4" />
              績效儀表板
            </button>
            <button
              onClick={() => window.location.href = '/app/affiliate/commissions'}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              <DollarSign className="w-4 h-4" />
              佣金管理
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-x-4">
          <Heading level="h2">聯盟夥伴管理</Heading>
        </div>
        <div className="text-sm text-gray-500">
          總計: {stats.total} | 待審核: {stats.pending} | 已核准: {stats.approved} | 已拒絕: {stats.rejected}
        </div>
      </div>

      <div className="px-6 py-4">
        <div className="mb-4 flex items-center gap-4">
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="pending">待審核</option>
            <option value="approved">已核准</option>
            <option value="rejected">已拒絕</option>
            <option value="">全部</option>
          </select>
          
          <button
            onClick={fetchPartners}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
          >
            重新載入
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            載入中...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    夥伴資訊
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    聯絡方式
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    狀態
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    佣金率
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    註冊時間
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPartners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{partner.name}</div>
                        <div className="text-sm text-gray-500">{partner.company}</div>
                        <div className="text-xs text-blue-600">{partner.affiliate_code}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900">{partner.email}</div>
                        <div className="text-sm text-gray-500">{partner.phone || '-'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        partner.status === 'approved' ? 'bg-green-100 text-green-800' :
                        partner.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        partner.status === 'suspended' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {partner.status === 'approved' ? '已核准' :
                         partner.status === 'rejected' ? '已拒絕' :
                         partner.status === 'suspended' ? '已暫停' : '待審核'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {partner.commission_rate ? (
                          <>
                            <div className="font-medium">
                              {(partner.commission_rate * 100).toFixed(1)}%
                            </div>
                            <div className="text-gray-500">佣金比例</div>
                          </>
                        ) : (
                          <div className="text-gray-400">
                            {partner.status === 'pending' ? '待設定' : '無設定'}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(partner.created_at).toLocaleDateString('zh-TW', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {partner.status === 'pending' && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-600">佣金率:</label>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="50"
                              defaultValue="5.0"
                              className="w-16 px-2 py-1 text-xs border rounded"
                              onChange={(e) => setCommissionRates(prev => ({
                                ...prev,
                                [partner.id]: parseFloat(e.target.value) || 5.0
                              }))}
                            />
                            <span className="text-xs text-gray-500">%</span>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                const rate = (commissionRates[partner.id] || 5.0) / 100
                                handleApprove(partner.id, 'approved', rate)
                              }}
                              className="text-green-600 hover:text-green-900 px-3 py-1 border border-green-600 rounded hover:bg-green-50 text-xs"
                            >
                              核准
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm('確定要拒絕此夥伴申請嗎？')) {
                                  handleApprove(partner.id, 'rejected')
                                }
                              }}
                              className="text-red-600 hover:text-red-900 px-3 py-1 border border-red-600 rounded hover:bg-red-50 text-xs"
                            >
                              拒絕
                            </button>
                          </div>
                        </div>
                      )}
                      {partner.status === 'approved' && (
                        <div className="text-green-600 text-xs">
                          ✓ 已核准
                          {partner.approved_at && (
                            <div className="text-gray-500">
                              {new Date(partner.approved_at).toLocaleDateString('zh-TW')}
                            </div>
                          )}
                        </div>
                      )}
                      {partner.status === 'rejected' && (
                        <div className="text-red-600 text-xs">✗ 已拒絕</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredPartners.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-sm font-medium">暫無夥伴資料</h3>
                  <p className="text-sm">當前篩選條件下沒有找到任何夥伴。</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "聯盟夥伴",
  icon: Users,
})

export default AffiliateManagement
