"use client"

import { useState, useEffect } from "react"
import { UnifiedButton } from "@/components/common/unified-button"
import { 
  TrendingUp, 
  TrendingDown,
  Calendar,
  DollarSign,
  Users,
  ShoppingBag,
  Download,
  Filter,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react"

interface EarningsData {
  date: string
  clicks: number
  conversions: number
  earnings: number
  orders: number
}

interface CommissionRule {
  product_category: string
  commission_rate: number
  tier_min_sales?: number
  tier_max_sales?: number
}

export default function AffiliateEarningsPage() {
  const [partner, setPartner] = useState<any>(null)
  const [earningsData, setEarningsData] = useState<EarningsData[]>([])
  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState("30days")
  const [selectedChart, setSelectedChart] = useState("earnings")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const savedPartner = localStorage.getItem("affiliate_partner")
    if (savedPartner) {
      setPartner(JSON.parse(savedPartner))
      loadEarningsData()
      loadCommissionRules()
    }
  }, [selectedPeriod])

  const loadEarningsData = () => {
    setLoading(true)
    // 模擬收益數據
    const mockData: EarningsData[] = []
    const days = selectedPeriod === "7days" ? 7 : selectedPeriod === "30days" ? 30 : 90
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      mockData.push({
        date: date.toISOString().split('T')[0],
        clicks: Math.floor(Math.random() * 50) + 10,
        conversions: Math.floor(Math.random() * 8) + 1,
        earnings: Math.floor(Math.random() * 500) + 50,
        orders: Math.floor(Math.random() * 5) + 1
      })
    }
    
    setEarningsData(mockData)
    setLoading(false)
  }

  const loadCommissionRules = () => {
    // 模擬佣金規則
    setCommissionRules([
      { product_category: "服飾", commission_rate: 8.5 },
      { product_category: "配件", commission_rate: 12.0 },
      { product_category: "鞋類", commission_rate: 10.0 },
      { product_category: "包包", commission_rate: 15.0 },
      { product_category: "特價商品", commission_rate: 5.0 }
    ])
  }

  const getTotalStats = () => {
    return earningsData.reduce((acc, day) => ({
      totalClicks: acc.totalClicks + day.clicks,
      totalConversions: acc.totalConversions + day.conversions,
      totalEarnings: acc.totalEarnings + day.earnings,
      totalOrders: acc.totalOrders + day.orders
    }), { totalClicks: 0, totalConversions: 0, totalEarnings: 0, totalOrders: 0 })
  }

  const getConversionRate = () => {
    const stats = getTotalStats()
    if (stats.totalClicks === 0) return 0
    return ((stats.totalConversions / stats.totalClicks) * 100).toFixed(2)
  }

  const getAverageOrderValue = () => {
    const stats = getTotalStats()
    if (stats.totalOrders === 0) return 0
    return (stats.totalEarnings / stats.totalOrders).toFixed(0)
  }

  const getGrowthRate = () => {
    if (earningsData.length < 2) return "0"
    
    const firstHalf = earningsData.slice(0, Math.floor(earningsData.length / 2))
    const secondHalf = earningsData.slice(Math.floor(earningsData.length / 2))
    
    const firstHalfTotal = firstHalf.reduce((sum, day) => sum + day.earnings, 0)
    const secondHalfTotal = secondHalf.reduce((sum, day) => sum + day.earnings, 0)
    
    if (firstHalfTotal === 0) return "100"
    return (((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100).toFixed(1)
  }

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "日期,點擊數,轉換數,收益,訂單數\n"
      + earningsData.map(row => 
          `${row.date},${row.clicks},${row.conversions},${row.earnings},${row.orders}`
        ).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `affiliate_earnings_${selectedPeriod}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const stats = getTotalStats()
  const growthRate = parseFloat(getGrowthRate())

  if (!partner) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-600">請先登入聯盟夥伴帳號</p>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">收益報告</h1>
          <p className="text-gray-600 mt-2">詳細的推廣收益和效果分析</p>
        </div>
        
        <div className="flex gap-2 mt-4 sm:mt-0">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value="7days">最近 7 天</option>
            <option value="30days">最近 30 天</option>
            <option value="90days">最近 90 天</option>
          </select>
          
          <UnifiedButton variant="secondary" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            匯出
          </UnifiedButton>
        </div>
      </div>

      {/* 總覽統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">總收益</p>
              <p className="text-2xl font-bold text-gray-900">NT$ {stats.totalEarnings.toLocaleString()}</p>
              <div className="flex items-center mt-1">
                {growthRate >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Math.abs(growthRate)}%
                </span>
                <span className="text-gray-500 text-sm ml-1">較前期</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">總點擊數</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalClicks.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">
                轉換率 {getConversionRate()}%
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">總訂單數</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              <p className="text-sm text-gray-500 mt-1">
                平均訂單 NT$ {getAverageOrderValue()}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <ShoppingBag className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">轉換數</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalConversions}</p>
              <p className="text-sm text-gray-500 mt-1">
                平均 {(stats.totalConversions / earningsData.length).toFixed(1)} 次/天
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-full">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 圖表區域 */}
      <div className="bg-white p-6 rounded-lg shadow border mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-xl font-semibold">趨勢分析</h2>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <button
              onClick={() => setSelectedChart("earnings")}
              className={`px-3 py-2 text-sm rounded-md ${
                selectedChart === "earnings" 
                  ? "bg-gray-900 text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <BarChart3 className="h-4 w-4 mr-1 inline" />
              收益
            </button>
            <button
              onClick={() => setSelectedChart("clicks")}
              className={`px-3 py-2 text-sm rounded-md ${
                selectedChart === "clicks" 
                  ? "bg-gray-900 text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <LineChart className="h-4 w-4 mr-1 inline" />
              點擊
            </button>
            <button
              onClick={() => setSelectedChart("conversions")}
              className={`px-3 py-2 text-sm rounded-md ${
                selectedChart === "conversions" 
                  ? "bg-gray-900 text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <PieChart className="h-4 w-4 mr-1 inline" />
              轉換
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-gray-500">載入圖表資料中...</div>
          </div>
        ) : (
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>圖表顯示區域</p>
              <p className="text-sm">
                {selectedChart === "earnings" && `顯示 ${selectedPeriod} 收益趨勢`}
                {selectedChart === "clicks" && `顯示 ${selectedPeriod} 點擊趨勢`}
                {selectedChart === "conversions" && `顯示 ${selectedPeriod} 轉換趨勢`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 詳細數據表格 */}
      <div className="bg-white rounded-lg shadow border mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">每日詳細數據</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日期
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
                  訂單數
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  收益
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {earningsData.slice().reverse().slice(0, 10).map((day, index) => (
                <tr key={day.date} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(day.date).toLocaleDateString('zh-TW')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {day.clicks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {day.conversions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {day.clicks > 0 ? ((day.conversions / day.clicks) * 100).toFixed(2) : 0}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {day.orders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    NT$ {day.earnings.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {earningsData.length > 10 && (
          <div className="p-4 text-center text-sm text-gray-500">
            顯示最近 10 天數據，完整報告請點擊「匯出」按鈕
          </div>
        )}
      </div>

      {/* 佣金規則 */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">佣金規則</h2>
          <p className="text-gray-600 text-sm mt-1">不同產品類別的佣金比例</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {commissionRules.map((rule, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{rule.product_category}</h3>
                  <span className="text-lg font-bold text-green-600">
                    {rule.commission_rate}%
                  </span>
                </div>
                {rule.tier_min_sales && rule.tier_max_sales && (
                  <p className="text-sm text-gray-500 mt-1">
                    銷售額 NT$ {rule.tier_min_sales.toLocaleString()} - {rule.tier_max_sales.toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
