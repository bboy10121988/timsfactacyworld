"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, DollarSign, TrendingUp, Users, Calendar, ChevronDown } from "lucide-react"
import { affiliateAPI, AffiliateStats, AffiliateEarning, AffiliatePartner } from "@/lib/affiliate-api"

interface EarningsPageClientProps {
  countryCode: string
}

export default function EarningsPageClient({ countryCode }: EarningsPageClientProps) {
  const [partner, setPartner] = useState<AffiliatePartner | null>(null)
  const [stats, setStats] = useState<AffiliateStats | null>(null)
  const [earnings, setEarnings] = useState<AffiliateEarning[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [earningsType, setEarningsType] = useState<'all' | 'self' | 'referral'>('all')

  useEffect(() => {
    loadData()
  }, [currentPage, filterStatus, selectedMonth, earningsType])

  const loadData = async () => {
    try {
      const [partner, earnings] = await Promise.all([
        affiliateAPI.getProfile(),
        affiliateAPI.getEarnings(currentPage, 10, earningsType, selectedMonth)
      ])

      const stats = await affiliateAPI.getPartnerStats(partner.id)
      setPartner(partner)
      setStats(stats)
      setEarnings(earnings.earnings)
      setTotalPages(earnings.totalPages)
    } catch (error: any) {
      setError(error.message || "載入數據失敗")
    } finally {
      setLoading(false)
    }
  }

  // 生成月份選項 (過去12個月)
  const generateMonthOptions = () => {
    const options = [{ value: "all", label: "全部月份" }]
    const today = new Date()
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const monthStr = month.toString().padStart(2, '0')
      const value = `${year}-${monthStr}`
      const label = `${year}年${month}月`
      options.push({ value, label })
    }
    
    return options
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return '已付款'
      case 'pending':
        return '待付款'
      case 'cancelled':
        return '已取消'
      default:
        return status
    }
  }

  const filteredEarnings = earnings.filter(earning => {
    if (filterStatus === 'all') return true
    return earning.status === filterStatus
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href={`/${countryCode}/affiliate`} className="text-blue-600 hover:text-blue-800">
            返回主頁
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頁首區域 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center">
            <Link 
              href={`/${countryCode}/affiliate`}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">收益報告</h1>
              <p className="text-gray-600">查看您的詳細收益統計和歷史記錄</p>
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="container mx-auto px-4 py-8">
        {/* 統計卡片 */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-md">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">總收益</p>
                  <p className="text-2xl font-bold text-gray-900">NT$ {stats.totalEarnings.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-md">
                  <Calendar className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">本月收益</p>
                  <p className="text-2xl font-bold text-gray-900">NT$ {stats.thisMonthEarnings.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-md">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">待付收益</p>
                  <p className="text-2xl font-bold text-gray-900">NT$ {stats.pendingEarnings.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-md">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">成功推薦</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalConversions}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 過濾器 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          {/* 月份篩選 */}
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <span className="text-sm font-medium text-gray-700 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              月份篩選：
            </span>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value)
                  setCurrentPage(1) // 重置到第一頁
                }}
                className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors cursor-pointer min-w-[140px]"
              >
                {generateMonthOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
          
          {/* 收益類型篩選 */}
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <span className="text-sm font-medium text-gray-700">收益類型：</span>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "all", label: "全部收益" },
                { value: "self", label: "自己收益" },
                { value: "referral", label: "下線收益" }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => {
                    setEarningsType(filter.value as any)
                    setCurrentPage(1) // 重置到第一頁
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    earningsType === filter.value
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* 狀態篩選 */}
          <div className="flex flex-wrap gap-4 items-center">
            <span className="text-sm font-medium text-gray-700">篩選狀態：</span>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "all", label: "全部" },
                { value: "paid", label: "已付款" },
                { value: "pending", label: "待付款" },
                { value: "cancelled", label: "已取消" }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setFilterStatus(filter.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filterStatus === filter.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 收益歷史表格 */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">收益歷史</h2>
          </div>

          {filteredEarnings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              暫無收益記錄
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      訂單
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      產品
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      訂單金額
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      佣金
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      狀態
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      日期
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEarnings.map((earning) => (
                    <tr key={earning.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {earning.orderNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {earning.customerEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{earning.productName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          NT$ {earning.orderAmount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            NT$ {earning.commissionAmount.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {(earning.commissionRate * 100).toFixed(1)}%
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(earning.status)}`}>
                          {getStatusText(earning.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">
                            {new Date(earning.createdAt).toLocaleDateString('zh-TW')}
                          </div>
                          {earning.paidAt && (
                            <div className="text-xs text-gray-500">
                              已付: {new Date(earning.paidAt).toLocaleDateString('zh-TW')}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 分頁 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-6">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一頁
            </button>
            
            <span className="px-3 py-2 text-sm text-gray-700">
              第 {currentPage} 頁，共 {totalPages} 頁
            </span>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一頁
            </button>
          </div>
        )}

        {/* 付款說明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="font-medium text-blue-900 mb-2">付款說明</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 佣金將在每月最後一個工作日統一結算</li>
            <li>• 最低提領金額為 NT$ 1,000</li>
            <li>• 付款後將發送通知郵件到您的註冊信箱</li>
            <li>• 如有疑問請聯繫客服：affiliate@example.com</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
