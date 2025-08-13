"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Save, Eye, EyeOff } from "lucide-react"
import { UnifiedButton } from "@/components/common/unified-button"
import { affiliateAPI, AffiliatePartner } from "@/lib/affiliate-api"

interface SettingsPageClientProps {
  countryCode: string
}

export default function SettingsPageClient({ countryCode }: SettingsPageClientProps) {
  const [partner, setPartner] = useState<AffiliatePartner | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  // 表單狀態
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
    socialMedia: "",
    address: ""
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    showCurrentPassword: false,
    showNewPassword: false
  })

  const [paymentForm, setPaymentForm] = useState({
    accountName: "",
    bankCode: "",
    accountNumber: "",
    taxId: ""
  })

  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    loadPartnerData()
  }, [])

  const loadPartnerData = async () => {
    try {
      const partnerData = await affiliateAPI.getProfile()
      setPartner(partnerData)
      
      // 填入表單
      setProfileForm({
        name: partnerData.name || "",
        email: partnerData.email || "",
        phone: partnerData.phone || "",
        website: partnerData.website || "",
        socialMedia: partnerData.socialMedia || "",
        address: partnerData.address || ""
      })

      setPaymentForm({
        accountName: partnerData.accountName || "",
        bankCode: partnerData.bankCode || "",
        accountNumber: partnerData.accountNumber || "",
        taxId: partnerData.taxId || ""
      })
    } catch (error) {
      console.error('載入合作夥伴資料失敗:', error)
      setError('載入資料失敗，請重新登入')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSave = async () => {
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const updatedPartner = await affiliateAPI.updateProfile(profileForm)
      setPartner(updatedPartner)
      setSuccess("個人資料更新成功！")
    } catch (error: any) {
      setError(error.message || "個人資料更新失敗")
      console.error('更新個人資料失敗:', error)
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSave = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("新密碼與確認密碼不符")
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setError("新密碼長度至少需要6個字元")
      return
    }

    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const result = await affiliateAPI.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })

      if (result.success) {
        setSuccess(result.message || "密碼更新成功！")
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
          showCurrentPassword: false,
          showNewPassword: false
        })
      } else {
        setError(result.message || "密碼更新失敗")
      }
    } catch (error: any) {
      setError(error.message || "密碼更新失敗")
      console.error('更新密碼失敗:', error)
    } finally {
      setSaving(false)
    }
  }

  const handlePaymentSave = async () => {
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const updatedPartner = await affiliateAPI.updatePaymentInfo(paymentForm)
      setPartner(updatedPartner)
      setSuccess("付款資訊更新成功！")
    } catch (error: any) {
      setError(error.message || "付款資訊更新失敗")
      console.error('更新付款資訊失敗:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">請先登入聯盟系統</p>
          <Link href={`/${countryCode}/affiliate`}>
            <UnifiedButton className="mt-4">
              前往登入
            </UnifiedButton>
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
              <h1 className="text-3xl font-bold text-gray-900">帳戶設定</h1>
              <p className="text-gray-600">更新您的個人資料和偏好設定</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 狀態訊息 */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border">
          {/* 標籤導航 */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "profile"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                個人資料
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "password"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                變更密碼
              </button>
              <button
                onClick={() => setActiveTab("payment")}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "payment"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                支付設定
              </button>
            </nav>
          </div>

          {/* 標籤內容 */}
          <div className="p-6">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">個人資料</h3>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      姓名 *
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="請輸入您的姓名"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      電子郵件 *
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="請輸入電子郵件"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      電話號碼
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="請輸入電話號碼"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      個人網站
                    </label>
                    <input
                      type="url"
                      value={profileForm.website}
                      onChange={(e) => setProfileForm({...profileForm, website: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    社群媒體
                  </label>
                  <input
                    type="text"
                    value={profileForm.socialMedia}
                    onChange={(e) => setProfileForm({...profileForm, socialMedia: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Instagram: @username, Facebook: /username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    地址
                  </label>
                  <textarea
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="請輸入完整地址"
                  />
                </div>

                <div className="flex justify-end">
                  <UnifiedButton
                    onClick={handleProfileSave}
                    disabled={saving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? '儲存中...' : '儲存變更'}
                  </UnifiedButton>
                </div>
              </div>
            )}

            {activeTab === "password" && (
              <div className="space-y-6 max-w-md">
                <h3 className="text-lg font-medium text-gray-900">變更密碼</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    目前密碼 *
                  </label>
                  <div className="relative">
                    <input
                      type={passwordForm.showCurrentPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="請輸入目前密碼"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordForm({...passwordForm, showCurrentPassword: !passwordForm.showCurrentPassword})}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {passwordForm.showCurrentPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    新密碼 *
                  </label>
                  <div className="relative">
                    <input
                      type={passwordForm.showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="請輸入新密碼"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordForm({...passwordForm, showNewPassword: !passwordForm.showNewPassword})}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {passwordForm.showNewPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">密碼長度至少需要6個字元</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    確認新密碼 *
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="請再次輸入新密碼"
                  />
                </div>

                <div className="flex justify-end">
                  <UnifiedButton
                    onClick={handlePasswordSave}
                    disabled={saving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? '更新中...' : '更新密碼'}
                  </UnifiedButton>
                </div>
              </div>
            )}

            {activeTab === "payment" && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">支付設定</h3>
                <p className="text-sm text-gray-600">
                  請填入您的銀行帳戶資訊，用於接收佣金支付。
                </p>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      戶名 *
                    </label>
                    <input
                      type="text"
                      value={paymentForm.accountName}
                      onChange={(e) => setPaymentForm({...paymentForm, accountName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="請輸入銀行帳戶戶名"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      銀行代碼 *
                    </label>
                    <input
                      type="text"
                      value={paymentForm.bankCode}
                      onChange={(e) => setPaymentForm({...paymentForm, bankCode: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例：822（中國信託）"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      帳戶號碼 *
                    </label>
                    <input
                      type="text"
                      value={paymentForm.accountNumber}
                      onChange={(e) => setPaymentForm({...paymentForm, accountNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="請輸入銀行帳戶號碼"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      統一編號
                    </label>
                    <input
                      type="text"
                      value={paymentForm.taxId}
                      onChange={(e) => setPaymentForm({...paymentForm, taxId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="選填，用於開立發票"
                    />
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        重要提醒
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          請確保提供的銀行資訊正確無誤。錯誤的資訊可能導致佣金支付延遲或失敗。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <UnifiedButton
                    onClick={handlePaymentSave}
                    disabled={saving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? '儲存中...' : '儲存支付資訊'}
                  </UnifiedButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
