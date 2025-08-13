'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import adminAPI, { AdminCommission } from '@/lib/admin-api'

export default function CommissionsManagement() {
  const [commissions, setCommissions] = useState<AdminCommission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (!adminAPI.isAuthenticated()) {
      router.push('/admin/login')
      return
    }

    loadCommissions()
  }, [router])

  const loadCommissions = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await adminAPI.getCommissions({
        page: 1,
        limit: 20
      })

      if (response.success) {
        setCommissions(response.data.items)
      } else {
        setError('載入佣金資料失敗')
      }
    } catch (error) {
      console.error('Failed to load commissions:', error)
      setError('載入資料時發生錯誤')
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
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/affiliate')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← 返回儀表板
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                佣金管理
              </h1>
            </div>
            <div className="flex items-center space-x-4">
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

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">佣金列表</h3>
          </div>
          <div className="p-6">
            {commissions.length > 0 ? (
              <div>
                <p className="text-gray-600 mb-4">
                  載入了 {commissions.length} 筆佣金記錄
                </p>
                <div className="space-y-4">
                  {commissions.map((commission) => (
                    <div key={commission.id} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900">{commission.partnerName}</h4>
                      <p className="text-sm text-gray-600">訂單: {commission.orderNumber}</p>
                      <p className="text-sm text-gray-500">金額: NT${commission.amount}</p>
                      <p className="text-sm text-gray-500">狀態: {commission.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">暫無佣金記錄</p>
                <p className="text-sm text-gray-400 mt-2">
                  這是正常的，因為系統剛剛設置完成
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
