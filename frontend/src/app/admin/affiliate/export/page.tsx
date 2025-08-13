'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import adminAPI from '@/lib/admin-api'

export default function DataExport() {
  const [isExporting, setIsExporting] = useState(false)
  const [exportType, setExportType] = useState<'partners' | 'commissions'>('partners')
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    to: new Date().toISOString().split('T')[0] // today
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (!adminAPI.isAuthenticated()) {
      router.push('/admin/login')
      return
    }
  }, [router])

  const handleExport = async () => {
    setIsExporting(true)
    setMessage('')
    setError('')

    try {
      let result
      
      if (exportType === 'partners') {
        result = await adminAPI.exportPartners({
          from: new Date(dateRange.from),
          to: new Date(dateRange.to)
        })
      } else {
        result = await adminAPI.exportCommissions({
          from: new Date(dateRange.from),
          to: new Date(dateRange.to)
        })
      }

      if (result.success) {
        // Create and download file
        const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        
        link.setAttribute('href', url)
        link.setAttribute('download', `${exportType}-${dateRange.from}-to-${dateRange.to}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        setMessage(`${exportType === 'partners' ? '合作夥伴' : '佣金'} 資料已成功導出`)
      } else {
        setError('導出失敗，請稍後再試')
      }
    } catch (error) {
      console.error('Export failed:', error)
      setError('導出過程中發生錯誤')
    } finally {
      setIsExporting(false)
    }
  }

  const handleLogout = () => {
    adminAPI.logout()
    router.push('/admin/login')
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
                資料導出
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

      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        {message && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">導出設定</h3>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                導出類型
              </label>
              <select
                value={exportType}
                onChange={(e) => setExportType(e.target.value as 'partners' | 'commissions')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="partners">合作夥伴資料</option>
                <option value="commissions">佣金記錄</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  開始日期
                </label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  結束日期
                </label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isExporting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
              >
                {isExporting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    導出中...
                  </>
                ) : (
                  `導出 ${exportType === 'partners' ? '合作夥伴' : '佣金'} 資料`
                )}
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">說明</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 資料將以 CSV 格式導出</li>
                <li>• 合作夥伴資料包含: 姓名、電子郵件、狀態、註冊時間等</li>
                <li>• 佣金記錄包含: 合作夥伴、訂單、金額、狀態等</li>
                <li>• 導出的檔案會自動下載到您的電腦</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
