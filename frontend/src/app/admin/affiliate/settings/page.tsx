'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import adminAPI from '@/lib/admin-api'

interface Settings {
  commissionRate: number
  minimumPayout: number
  payoutFrequency: 'weekly' | 'monthly'
  autoApproval: boolean
  notificationEmail: string
}

export default function SystemSettings() {
  const [settings, setSettings] = useState<Settings>({
    commissionRate: 5.0, // Default 5%
    minimumPayout: 100, // Default NT$100
    payoutFrequency: 'monthly',
    autoApproval: false,
    notificationEmail: 'admin@example.com'
  })
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (!adminAPI.isAuthenticated()) {
      router.push('/admin/login')
      return
    }
    
    // Load existing settings (mock for now)
    // In real implementation, you would load from API
    loadSettings()
  }, [router])

  const loadSettings = async () => {
    // Mock loading settings - in real app, load from API
    console.log('Loading system settings...')
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage('')
    setError('')

    try {
      // Mock saving - in real implementation, save to API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMessage('設定已成功儲存')
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Failed to save settings:', error)
      setError('儲存設定時發生錯誤')
    } finally {
      setIsSaving(false)
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
                系統設定
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
            <h3 className="text-lg font-medium text-gray-900">聯盟行銷設定</h3>
          </div>
          <div className="p-6 space-y-6">
            
            {/* Commission Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                基本佣金比率 (%)
              </label>
              <div className="mt-1 relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={settings.commissionRate}
                  onChange={(e) => setSettings({ ...settings, commissionRate: parseFloat(e.target.value) || 0 })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">%</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                合作夥伴可獲得的基本佣金百分比
              </p>
            </div>

            {/* Minimum Payout */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                最低提領金額 (NT$)
              </label>
              <div className="mt-1 relative">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={settings.minimumPayout}
                  onChange={(e) => setSettings({ ...settings, minimumPayout: parseInt(e.target.value) || 0 })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">NT$</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                合作夥伴申請提領的最低金額門檻
              </p>
            </div>

            {/* Payout Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                付款週期
              </label>
              <select
                value={settings.payoutFrequency}
                onChange={(e) => setSettings({ ...settings, payoutFrequency: e.target.value as 'weekly' | 'monthly' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="weekly">每週</option>
                <option value="monthly">每月</option>
              </select>
              <p className="mt-2 text-sm text-gray-500">
                系統自動處理佣金付款的頻率
              </p>
            </div>

            {/* Auto Approval */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  checked={settings.autoApproval}
                  onChange={(e) => setSettings({ ...settings, autoApproval: e.target.checked })}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label className="font-medium text-gray-700">
                  自動審核合作夥伴申請
                </label>
                <p className="text-gray-500">
                  啟用後，新的合作夥伴申請將自動通過審核，無需手動批准
                </p>
              </div>
            </div>

            {/* Notification Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                通知電子郵件
              </label>
              <input
                type="email"
                value={settings.notificationEmail}
                onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="admin@example.com"
              />
              <p className="mt-2 text-sm text-gray-500">
                系統通知將發送到此電子郵件地址
              </p>
            </div>

            {/* Save Button */}
            <div className="border-t border-gray-200 pt-6">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isSaving 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    儲存中...
                  </>
                ) : (
                  '儲存設定'
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">說明</h3>
          </div>
          <div className="p-6">
            <div className="prose text-sm text-gray-600">
              <ul className="space-y-2">
                <li><strong>佣金比率：</strong> 決定合作夥伴從每筆成功推薦訂單中獲得的百分比</li>
                <li><strong>最低提領：</strong> 合作夥伴帳戶餘額必須達到此金額才能申請提領</li>
                <li><strong>付款週期：</strong> 系統自動處理已核准佣金的頻率</li>
                <li><strong>自動審核：</strong> 建議在初期關閉，以便手動審查每個申請</li>
                <li><strong>通知電子郵件：</strong> 重要系統事件（如新申請、付款失敗等）的通知地址</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
