'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import adminAPI, { AdminStats, AdminPartner, AdminCommission } from '@/lib/admin-api'

interface DashboardData {
  stats: AdminStats | null
  recentPartners: AdminPartner[]
  recentCommissions: AdminCommission[]
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData>({
    stats: null,
    recentPartners: [],
    recentCommissions: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (!adminAPI.isAuthenticated()) {
      router.push('/admin/login')
      return
    }

    loadDashboardData()
  }, [router])

  const loadDashboardData = async () => {
    setIsLoading(true)
    setError('')

    try {
      // 並行加載數據
      const [statsResponse, partnersResponse, commissionsResponse] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getPartners({ page: 1, limit: 5 }),
        adminAPI.getCommissions({ page: 1, limit: 5 })
      ])

      setData({
        stats: statsResponse.success ? statsResponse.data : null,
        recentPartners: partnersResponse.success ? partnersResponse.data.items : [],
        recentCommissions: commissionsResponse.success ? commissionsResponse.data.items : []
      })

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      setError('載入數據失敗，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    adminAPI.logout()
    router.push('/admin/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Tim's Factory 管理員後台
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/affiliate/partners')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                合作夥伴管理
              </button>
              <button
                onClick={() => router.push('/admin/affiliate/commissions')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                佣金管理
              </button>
              <button
                onClick={() => router.push('/admin/affiliate/export')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                資料導出
              </button>
              <button
                onClick={() => router.push('/admin/affiliate/settings')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                系統設定
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                登出
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        {data.stats && (
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">系統統計</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Partners Stats */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">P</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">總合作夥伴</dt>
                        <dd className="text-lg font-medium text-gray-900">{data.stats.partners.total}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm text-gray-600">
                    待審核: {data.stats.partners.pending} | 
                    已核准: {data.stats.partners.approved} | 
                    已拒絕: {data.stats.partners.rejected}
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">$</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">總佣金</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          NT${data.stats.performance.totalCommissions.toLocaleString()}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm text-gray-600">
                    本月: NT${data.stats.performance.monthlyCommissions.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Conversions Stats */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">C</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">總轉換數</dt>
                        <dd className="text-lg font-medium text-gray-900">{data.stats.performance.totalConversions}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm text-gray-600">
                    轉換率: {data.stats.performance.conversionRate.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Clicks Stats */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">👆</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">總點擊數</dt>
                        <dd className="text-lg font-medium text-gray-900">{data.stats.performance.totalClicks}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm text-gray-600">
                    本月轉換: {data.stats.performance.monthlyConversions}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Partners */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">最新合作夥伴</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {data.recentPartners.length > 0 ? (
                data.recentPartners.map((partner) => (
                  <div key={partner.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{partner.name}</div>
                        <div className="text-sm text-gray-500">{partner.email}</div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          partner.status === 'approved' ? 'bg-green-100 text-green-800' :
                          partner.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          partner.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {partner.status === 'approved' ? '已核准' :
                           partner.status === 'pending' ? '待審核' :
                           partner.status === 'rejected' ? '已拒絕' : '暫停'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(partner.createdAt).toLocaleDateString('zh-TW')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  暫無合作夥伴數據
                </div>
              )}
            </div>
            <div className="px-6 py-3 bg-gray-50">
              <button
                onClick={() => router.push('/admin/affiliate/partners')}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                查看所有合作夥伴 →
              </button>
            </div>
          </div>

          {/* Recent Commissions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">最新佣金</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {data.recentCommissions.length > 0 ? (
                data.recentCommissions.map((commission) => (
                  <div key={commission.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{commission.partnerName}</div>
                        <div className="text-sm text-gray-500">訂單 #{commission.orderNumber}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          NT${commission.amount.toLocaleString()}
                        </div>
                        <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          commission.status === 'paid' ? 'bg-green-100 text-green-800' :
                          commission.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          commission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {commission.status === 'paid' ? '已支付' :
                           commission.status === 'confirmed' ? '已確認' :
                           commission.status === 'pending' ? '待處理' : '已取消'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  暫無佣金數據
                </div>
              )}
            </div>
            <div className="px-6 py-3 bg-gray-50">
              <button
                onClick={() => router.push('/admin/affiliate/commissions')}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                查看所有佣金 →
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">快速操作</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/admin/affiliate/partners')}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                管理合作夥伴
              </button>
              <button
                onClick={() => router.push('/admin/affiliate/commissions')}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                處理佣金
              </button>
              <button
                onClick={loadDashboardData}
                className="flex items-center justify-center px-4 py-2 border border-indigo-300 rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
              >
                重新整理數據
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
