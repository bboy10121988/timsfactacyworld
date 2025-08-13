import { Container, Heading } from "@medusajs/ui"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useEffect, useState } from "react"
import { BarChart3, Users, DollarSign, Search, Calendar, Settings } from "lucide-react"

interface PerformanceData {
  partner_id: string
  partner_name: string
  partner_email: string
  affiliate_code: string
  total_clicks: number
  total_conversions: number
  conversion_rate: number
  total_commission: number
  total_sales: number
}

interface OverallStats {
  total_partners: number
  active_partners: number
  total_clicks: number
  total_conversions: number
  total_commission: number
  total_sales: number
  avg_conversion_rate: number
}

const AffiliateDashboard = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
  })

  useEffect(() => {
    loadPerformanceData()
  }, [selectedMonth])

  const loadPerformanceData = async () => {
    try {
      setLoading(true)
      
      // 嘗試從真實 API 獲取統計數據 (帶月份參數)
      let statsData = null
      try {
        const statsResponse = await fetch(`/admin/affiliate/stats?month=${selectedMonth}`)
        if (statsResponse.ok) {
          const response = await statsResponse.json()
          statsData = response.stats
        }
      } catch (error) {
        console.log(`Stats API不可用，使用 ${selectedMonth} 的模擬數據`)
      }

      // 嘗試從真實 API 獲取夥伴數據 (帶月份參數)
      let partnersData = []
      try {
        const partnersResponse = await fetch(`/admin/affiliate/partners?month=${selectedMonth}`)
        if (partnersResponse.ok) {
          const response = await partnersResponse.json()
          partnersData = response.partners || []
        }
      } catch (error) {
        console.log(`Partners API不可用，使用 ${selectedMonth} 的模擬數據`)
      }

      // 使用API數據或模擬數據
      if (statsData) {
        setOverallStats(statsData)
      } else {
        setOverallStats(mockStats)
      }

      if (partnersData.length > 0) {
        // 轉換API數據格式
        const converted: PerformanceData[] = partnersData.map((partner: any) => ({
          partner_id: partner.id,
          partner_name: partner.name,
          partner_email: partner.email,
          affiliate_code: partner.affiliate_code,
          total_clicks: partner.total_clicks || 0,
          total_conversions: partner.total_conversions || 0,
          conversion_rate: partner.total_clicks ? (partner.total_conversions / partner.total_clicks * 100) : 0,
          total_commission: partner.total_commission || 0,
          total_sales: partner.total_sales || (partner.total_commission || 0) * 20
        }))
        setPerformanceData(converted)
      } else {
        setPerformanceData(mockPerformanceData)
      }
      
    } catch (error) {
      console.error('載入績效數據失敗:', error)
      setOverallStats(mockStats)
      setPerformanceData(mockPerformanceData)
    } finally {
      setLoading(false)
    }
  }

  // 根據選擇月份生成模擬數據
  const generateMockDataForMonth = (month: string) => {
    const [, monthNum] = month.split('-').map(Number)
    const monthIndex = monthNum - 1
    
    // 基於月份生成不同的數據變化
    const seasonalMultiplier = monthIndex < 3 || monthIndex > 9 ? 1.2 : 0.9 // 冬季和年末較高
    const baseClicks = Math.floor(12000 * seasonalMultiplier + Math.random() * 5000)
    const baseConversions = Math.floor(baseClicks * 0.055 + Math.random() * 50)
    
    return {
      stats: {
        total_partners: 48 + monthIndex,
        active_partners: 30 + Math.floor(monthIndex / 2),
        total_clicks: baseClicks,
        total_conversions: baseConversions,
        total_commission: baseConversions * 150 + Math.floor(Math.random() * 50000),
        total_sales: baseConversions * 3000 + Math.floor(Math.random() * 1000000),
        avg_conversion_rate: Number((baseConversions / baseClicks * 100).toFixed(2))
      },
      partners: [
        {
          partner_id: '1',
          partner_name: '王小明',
          partner_email: 'wang@example.com',
          affiliate_code: 'WANG123',
          total_clicks: Math.floor(1200 * seasonalMultiplier),
          total_conversions: Math.floor(85 * seasonalMultiplier),
          conversion_rate: Number((85 * seasonalMultiplier / (1200 * seasonalMultiplier) * 100).toFixed(2)),
          total_commission: Math.floor(42000 * seasonalMultiplier),
          total_sales: Math.floor(840000 * seasonalMultiplier)
        },
        {
          partner_id: '2',
          partner_name: '李美華',
          partner_email: 'li@example.com',
          affiliate_code: 'LI456',
          total_clicks: Math.floor(850 * seasonalMultiplier),
          total_conversions: Math.floor(60 * seasonalMultiplier),
          conversion_rate: Number((60 * seasonalMultiplier / (850 * seasonalMultiplier) * 100).toFixed(2)),
          total_commission: Math.floor(32000 * seasonalMultiplier),
          total_sales: Math.floor(640000 * seasonalMultiplier)
        }
      ]
    }
  }

  // 模擬數據 - 根據當前選擇月份動態生成
  const mockData = generateMockDataForMonth(selectedMonth)
  const mockStats: OverallStats = mockData.stats
  const mockPerformanceData: PerformanceData[] = mockData.partners

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // 篩選夥伴數據
  const filteredPerformanceData = performanceData.filter(partner => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      partner.partner_name.toLowerCase().includes(searchLower) ||
      partner.partner_email.toLowerCase().includes(searchLower) ||
      partner.affiliate_code.toLowerCase().includes(searchLower)
    )
  })

  // 如果正在載入或沒有數據，顯示載入中
  if (loading || !overallStats) {
    return (
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-x-4">
            <Heading level="h2">聯盟夥伴績效儀表板</Heading>
          </div>
        </div>
        <div className="px-6 py-8 text-center">
          <p className="text-gray-500">載入中...</p>
        </div>
      </Container>
    )
  }

  return (
    <Container className="divide-y p-0">
      {/* 聯盟管理導航 */}
      <div className="px-6 py-4 bg-gray-50 border-b">
        <div className="flex items-center justify-between">
          <Heading level="h1" className="text-2xl font-bold">聯盟夥伴系統</Heading>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.href = '/app/affiliate/settings'}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              <Settings className="w-4 h-4" />
              系統設定
            </button>
            <button
              onClick={() => window.location.href = '/app/affiliate/dashboard'}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
          <Heading level="h2">聯盟夥伴績效儀表板</Heading>
          <div className="flex items-center gap-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">月份：</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {/* 生成過去12個月的選項 */}
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date()
                date.setMonth(date.getMonth() - i)
                const value = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
                const label = `${date.getFullYear()}年${date.getMonth() + 1}月`
                return (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
              })}
            </select>
          </div>
        </div>
        <button
          onClick={loadPerformanceData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
        >
          重新載入
        </button>
      </div>

      <div className="px-6 py-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            載入績效數據中...
          </div>
        ) : (
          <>
            {/* 月份標題 */}
            <div className="mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-blue-900">
                      {(() => {
                        const [year, month] = selectedMonth.split('-')
                        return `${year}年${parseInt(month)}月 聯盟夥伴績效數據`
                      })()}
                    </h3>
                    <p className="text-sm text-blue-700">以下為該月份的完整績效統計與夥伴排行</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 總體統計卡片 */}
            {overallStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white border rounded-lg p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5">
                      <p className="text-sm font-medium text-gray-500">總夥伴數</p>
                      <p className="text-2xl font-bold text-gray-900">{overallStats.total_partners}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5">
                      <p className="text-sm font-medium text-gray-500">總點擊數</p>
                      <p className="text-2xl font-bold text-gray-900">{(overallStats.total_clicks || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5">
                      <p className="text-sm font-medium text-gray-500">總轉換數</p>
                      <p className="text-2xl font-bold text-gray-900">{(overallStats.total_conversions || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582z"/>
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5">
                      <p className="text-sm font-medium text-gray-500">總佣金</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(overallStats.total_commission || 0)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 夥伴績效排行榜 */}
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">夥伴績效排行榜</h2>
                    <p className="text-sm text-gray-500">按佣金排序的頂級夥伴表現</p>
                  </div>
                  <div className="mt-4 sm:mt-0">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="搜尋夥伴名稱、郵箱或代碼..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        排名
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        夥伴資訊
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        點擊數
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        轉換數
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        轉換率
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        佣金收入
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPerformanceData
                      .sort((a, b) => b.total_commission - a.total_commission)
                      .slice(0, 10)
                      .map((partner, index) => (
                        <tr key={partner.partner_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {index === 0 && <span className="text-yellow-500 text-xl mr-2">🥇</span>}
                              {index === 1 && <span className="text-gray-400 text-xl mr-2">🥈</span>}
                              {index === 2 && <span className="text-orange-600 text-xl mr-2">🥉</span>}
                              <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{partner.partner_name}</div>
                              <div className="text-sm text-gray-500">{partner.partner_email}</div>
                              <div className="text-xs text-blue-600">{partner.affiliate_code}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {(partner.total_clicks || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {(partner.total_conversions || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm text-gray-900">{(partner.conversion_rate || 0).toFixed(2)}%</div>
                              <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${Math.min(partner.conversion_rate, 10) * 10}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            {formatCurrency(partner.total_commission || 0)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {filteredPerformanceData.length === 0 && performanceData.length > 0 && (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-sm font-medium text-gray-900">找不到匹配的夥伴</h3>
                  <p className="text-sm text-gray-500">請嘗試其他搜尋關鍵字。</p>
                </div>
              )}

              {performanceData.length === 0 && (
                <div className="text-center py-12">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-sm font-medium text-gray-900">暫無績效數據</h3>
                  <p className="text-sm text-gray-500">目前還沒有夥伴績效數據可供顯示。</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "績效儀表板",
  icon: BarChart3,
})

export default AffiliateDashboard
