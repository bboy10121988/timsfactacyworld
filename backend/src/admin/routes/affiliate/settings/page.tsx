import { Container, Heading } from "@medusajs/ui"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useEffect, useState } from "react"
import { Settings, Save, DollarSign, Users, BarChart3 } from "lucide-react"

interface AffiliateSettings {
  commissionRate: number
  minimumPayout: number
  payoutFrequency: 'weekly' | 'monthly'
  autoApproval: boolean
  notificationEmail: string
  referralCommissionRate: number
  enableReferralSystem: boolean
}

const AffiliateSettings = () => {
  const [settings, setSettings] = useState<AffiliateSettings>({
    commissionRate: 0.10, // 10%
    minimumPayout: 100, // NT$100
    payoutFrequency: 'monthly',
    autoApproval: false,
    notificationEmail: 'admin@example.com',
    referralCommissionRate: 0.05, // 5% for referrers
    enableReferralSystem: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/admin/affiliate/settings')
      
      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          setSettings(data.settings)
        }
      } else {
        console.log('設定 API 不可用，使用預設值')
      }
    } catch (error) {
      console.error('載入設定失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage('')
      
      const response = await fetch('/admin/affiliate/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        setMessage('設定已成功儲存')
        setTimeout(() => setMessage(''), 3000)
      } else {
        // Fallback to local storage for demo
        localStorage.setItem('affiliate_settings', JSON.stringify(settings))
        setMessage('設定已儲存到本地 (API 不可用)')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('儲存設定失敗:', error)
      // Fallback to local storage
      localStorage.setItem('affiliate_settings', JSON.stringify(settings))
      setMessage('API 錯誤，設定已儲存到本地')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: keyof AffiliateSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <Container>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-600">載入中...</div>
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
              onClick={() => window.location.href = '/app/affiliate'}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
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
            <button
              onClick={() => window.location.href = '/app/affiliate/settings'}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Settings className="w-4 h-4" />
              系統設定
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-6">
          <Heading level="h2">聯盟系統設定</Heading>
          {message && (
            <div className={`px-4 py-2 rounded-md text-sm ${
              message.includes('成功') 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {message}
            </div>
          )}
        </div>

        <div className="max-w-4xl space-y-8">
          {/* 基本佣金設定 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">基本佣金設定</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  基本佣金比率 (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={(settings.commissionRate * 100).toFixed(1)}
                    onChange={(e) => updateSetting('commissionRate', parseFloat(e.target.value) / 100)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  合作夥伴可獲得的基本佣金百分比
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最低提領金額 (NT$)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={settings.minimumPayout}
                    onChange={(e) => updateSetting('minimumPayout', parseInt(e.target.value) || 0)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 pl-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">NT$</span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  合作夥伴申請提領的最低金額門檻
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                付款週期
              </label>
              <select
                value={settings.payoutFrequency}
                onChange={(e) => updateSetting('payoutFrequency', e.target.value as 'weekly' | 'monthly')}
                className="block w-full md:w-1/2 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="weekly">每週</option>
                <option value="monthly">每月</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                系統自動處理佣金付款的頻率
              </p>
            </div>
          </div>

          {/* 推薦系統設定 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">推薦系統設定</h3>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={settings.enableReferralSystem}
                    onChange={(e) => updateSetting('enableReferralSystem', e.target.checked)}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3">
                  <label className="text-sm font-medium text-gray-700">
                    啟用推薦系統
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    允許合作夥伴推薦新夥伴並獲得推薦佣金
                  </p>
                </div>
              </div>

              {settings.enableReferralSystem && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    推薦佣金比率 (%)
                  </label>
                  <div className="relative w-full md:w-1/2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={(settings.referralCommissionRate * 100).toFixed(1)}
                      onChange={(e) => updateSetting('referralCommissionRate', parseFloat(e.target.value) / 100)}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">%</span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    推薦人從被推薦人業績中獲得的佣金百分比
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 系統管理設定 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">系統管理設定</h3>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={settings.autoApproval}
                    onChange={(e) => updateSetting('autoApproval', e.target.checked)}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3">
                  <label className="text-sm font-medium text-gray-700">
                    自動審核合作夥伴申請
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    啟用後，新的合作夥伴申請將自動通過審核，無需手動批准
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  通知電子郵件
                </label>
                <input
                  type="email"
                  value={settings.notificationEmail}
                  onChange={(e) => updateSetting('notificationEmail', e.target.value)}
                  className="block w-full md:w-2/3 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="admin@example.com"
                />
                <p className="mt-1 text-xs text-gray-500">
                  系統通知將發送到此電子郵件地址
                </p>
              </div>
            </div>
          </div>

          {/* 儲存按鈕 */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-medium ${
                saving 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Save className="w-4 h-4" />
              {saving ? '儲存中...' : '儲存設定'}
            </button>
          </div>

          {/* 說明區域 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="text-sm font-semibold text-blue-800 mb-3">設定說明</h4>
            <div className="text-xs text-blue-700 space-y-2">
              <p><strong>基本佣金率：</strong> 決定合作夥伴從每筆成功推薦訂單中獲得的百分比</p>
              <p><strong>推薦佣金率：</strong> 當啟用推薦系統時，推薦人從被推薦人業績中獲得的額外佣金</p>
              <p><strong>最低提領：</strong> 合作夥伴帳戶餘額必須達到此金額才能申請提領</p>
              <p><strong>付款週期：</strong> 系統自動處理已核准佣金的頻率</p>
              <p><strong>自動審核：</strong> 建議在初期關閉，以便手動審查每個申請</p>
              <p><strong>通知電子郵件：</strong> 重要系統事件（如新申請、付款失敗等）的通知地址</p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "系統設定",
  icon: Settings,
})

export default AffiliateSettings
