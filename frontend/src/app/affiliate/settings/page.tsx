"use client"

import { useState, useEffect } from "react"
import { UnifiedButton } from "@/components/common/unified-button"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Globe, 
  CreditCard,
  Bell,
  Shield,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle
} from "lucide-react"

interface PartnerProfile {
  id: string
  email: string
  company_name: string
  contact_person: string
  phone: string
  address: string
  website?: string
  affiliate_code: string
  bank_account?: string
  bank_name?: string
  account_holder?: string
  payment_method: "bank_transfer" | "paypal" | "other"
  notification_settings: {
    email_reports: boolean
    commission_alerts: boolean
    new_products: boolean
    system_updates: boolean
  }
  two_factor_enabled: boolean
}

export default function AffiliateSettingsPage() {
  const [partner, setPartner] = useState<PartnerProfile | null>(null)
  const [activeTab, setActiveTab] = useState("profile")
  const [showPassword, setShowPassword] = useState(false)
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  })
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadPartnerProfile()
  }, [])

  const loadPartnerProfile = () => {
    // 模擬載入聯盟夥伴資料
    const mockProfile: PartnerProfile = {
      id: "partner_123",
      email: "partner@example.com",
      company_name: "時尚推廣工作室",
      contact_person: "王小明",
      phone: "0912-345-678",
      address: "台北市信義區信義路五段7號",
      website: "https://fashion-promo.com",
      affiliate_code: "AFF12345678",
      bank_account: "123-456-789012",
      bank_name: "台灣銀行",
      account_holder: "王小明",
      payment_method: "bank_transfer",
      notification_settings: {
        email_reports: true,
        commission_alerts: true,
        new_products: false,
        system_updates: true
      },
      two_factor_enabled: false
    }
    
    setPartner(mockProfile)
    localStorage.setItem("affiliate_partner", JSON.stringify(mockProfile))
  }

  const updateProfile = async () => {
    if (!partner) return
    
    setLoading(true)
    setError("")
    
    try {
      // 這裡會調用實際的 API
      // await fetch('/api/affiliate/profile', { method: 'PUT', body: JSON.stringify(partner) })
      
      localStorage.setItem("affiliate_partner", JSON.stringify(partner))
      setSuccess("個人資料已更新")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError("更新失敗，請稍後再試")
    } finally {
      setLoading(false)
    }
  }

  const updatePassword = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setError("請填寫所有密碼欄位")
      return
    }
    
    if (passwords.new !== passwords.confirm) {
      setError("新密碼確認不一致")
      return
    }
    
    if (passwords.new.length < 8) {
      setError("新密碼至少需要 8 個字元")
      return
    }
    
    setLoading(true)
    setError("")
    
    try {
      // 這裡會調用實際的 API
      // await fetch('/api/affiliate/change-password', { method: 'POST', body: JSON.stringify(passwords) })
      
      setPasswords({ current: "", new: "", confirm: "" })
      setSuccess("密碼已更新")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError("密碼更新失敗")
    } finally {
      setLoading(false)
    }
  }

  const toggleTwoFactor = async () => {
    if (!partner) return
    
    setLoading(true)
    
    try {
      const newStatus = !partner.two_factor_enabled
      setPartner({ ...partner, two_factor_enabled: newStatus })
      
      setSuccess(newStatus ? "雙重驗證已啟用" : "雙重驗證已停用")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError("設定失敗")
    } finally {
      setLoading(false)
    }
  }

  const generateNewAffiliateCode = () => {
    if (!partner) return
    
    const newCode = "AFF" + Math.random().toString(36).substring(2, 10).toUpperCase()
    setPartner({ ...partner, affiliate_code: newCode })
    setSuccess("新的聯盟代碼已生成")
    setTimeout(() => setSuccess(""), 3000)
  }

  if (!partner) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-600">載入設定中...</p>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">帳號設定</h1>
        <p className="text-gray-600 mt-2">管理您的個人資料和帳號設定</p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* 頁籤導航 */}
      <div className="bg-white rounded-lg shadow border mb-8">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "profile"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <User className="h-4 w-4 mr-2 inline" />
              個人資料
            </button>
            <button
              onClick={() => setActiveTab("payment")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "payment"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <CreditCard className="h-4 w-4 mr-2 inline" />
              收款設定
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "notifications"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Bell className="h-4 w-4 mr-2 inline" />
              通知設定
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "security"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Shield className="h-4 w-4 mr-2 inline" />
              安全設定
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* 個人資料頁籤 */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-1" />
                    電子郵件
                  </label>
                  <input
                    type="email"
                    value={partner.email}
                    onChange={(e) => setPartner({ ...partner, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-1" />
                    聯絡人姓名
                  </label>
                  <input
                    type="text"
                    value={partner.contact_person}
                    onChange={(e) => setPartner({ ...partner, contact_person: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="h-4 w-4 inline mr-1" />
                    公司/工作室名稱
                  </label>
                  <input
                    type="text"
                    value={partner.company_name}
                    onChange={(e) => setPartner({ ...partner, company_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-1" />
                    聯絡電話
                  </label>
                  <input
                    type="tel"
                    value={partner.phone}
                    onChange={(e) => setPartner({ ...partner, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    地址
                  </label>
                  <input
                    type="text"
                    value={partner.address}
                    onChange={(e) => setPartner({ ...partner, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="h-4 w-4 inline mr-1" />
                    網站 (可選)
                  </label>
                  <input
                    type="url"
                    value={partner.website || ""}
                    onChange={(e) => setPartner({ ...partner, website: e.target.value })}
                    placeholder="https://your-website.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <UnifiedButton onClick={updateProfile} disabled={loading}>
                  {loading ? "更新中..." : "儲存變更"}
                </UnifiedButton>
              </div>
            </div>
          )}

          {/* 收款設定頁籤 */}
          {activeTab === "payment" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  聯盟代碼
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={partner.affiliate_code}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                  <UnifiedButton 
                    variant="secondary" 
                    onClick={generateNewAffiliateCode}
                  >
                    重新生成
                  </UnifiedButton>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  此代碼將用於追蹤您的推廣連結
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  收款方式
                </label>
                <select
                  value={partner.payment_method}
                  onChange={(e) => setPartner({ 
                    ...partner, 
                    payment_method: e.target.value as "bank_transfer" | "paypal" | "other"
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="bank_transfer">銀行轉帳</option>
                  <option value="paypal">PayPal</option>
                  <option value="other">其他</option>
                </select>
              </div>

              {partner.payment_method === "bank_transfer" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      銀行名稱
                    </label>
                    <input
                      type="text"
                      value={partner.bank_name || ""}
                      onChange={(e) => setPartner({ ...partner, bank_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      帳戶名稱
                    </label>
                    <input
                      type="text"
                      value={partner.account_holder || ""}
                      onChange={(e) => setPartner({ ...partner, account_holder: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      銀行帳號
                    </label>
                    <input
                      type="text"
                      value={partner.bank_account || ""}
                      onChange={(e) => setPartner({ ...partner, bank_account: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <UnifiedButton onClick={updateProfile} disabled={loading}>
                  {loading ? "更新中..." : "儲存收款設定"}
                </UnifiedButton>
              </div>
            </div>
          )}

          {/* 通知設定頁籤 */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">電子郵件報告</h3>
                    <p className="text-sm text-gray-500">接收每週收益報告</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={partner.notification_settings.email_reports}
                      onChange={(e) => setPartner({
                        ...partner,
                        notification_settings: {
                          ...partner.notification_settings,
                          email_reports: e.target.checked
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">佣金提醒</h3>
                    <p className="text-sm text-gray-500">當有新的佣金收入時通知</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={partner.notification_settings.commission_alerts}
                      onChange={(e) => setPartner({
                        ...partner,
                        notification_settings: {
                          ...partner.notification_settings,
                          commission_alerts: e.target.checked
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">新產品通知</h3>
                    <p className="text-sm text-gray-500">當有新產品上架時通知</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={partner.notification_settings.new_products}
                      onChange={(e) => setPartner({
                        ...partner,
                        notification_settings: {
                          ...partner.notification_settings,
                          new_products: e.target.checked
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">系統更新</h3>
                    <p className="text-sm text-gray-500">系統維護和更新通知</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={partner.notification_settings.system_updates}
                      onChange={(e) => setPartner({
                        ...partner,
                        notification_settings: {
                          ...partner.notification_settings,
                          system_updates: e.target.checked
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t">
                <UnifiedButton onClick={updateProfile} disabled={loading}>
                  {loading ? "更新中..." : "儲存通知設定"}
                </UnifiedButton>
              </div>
            </div>
          )}

          {/* 安全設定頁籤 */}
          {activeTab === "security" && (
            <div className="space-y-8">
              {/* 修改密碼 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">修改密碼</h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      目前密碼
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwords.current}
                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      新密碼
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      確認新密碼
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>

                  <UnifiedButton onClick={updatePassword} disabled={loading}>
                    {loading ? "更新中..." : "更新密碼"}
                  </UnifiedButton>
                </div>
              </div>

              {/* 雙重驗證 */}
              <div className="pt-8 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">雙重驗證</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      為您的帳號增加額外的安全保護
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm ${partner.two_factor_enabled ? 'text-green-600' : 'text-gray-500'}`}>
                      {partner.two_factor_enabled ? '已啟用' : '未啟用'}
                    </span>
                    <UnifiedButton 
                      variant={partner.two_factor_enabled ? "secondary" : "primary"}
                      onClick={toggleTwoFactor}
                      disabled={loading}
                    >
                      <Key className="h-4 w-4 mr-2" />
                      {partner.two_factor_enabled ? '停用' : '啟用'}
                    </UnifiedButton>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
