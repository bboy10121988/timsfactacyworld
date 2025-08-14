"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { UnifiedButton } from "@/components/common/unified-button"
import { 
  LogIn, 
  UserPlus, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Link as LinkIcon, 
  Copy, 
  LogOut,
  Settings,
  BarChart3,
  Target,
  Home,
  Menu,
  X
} from "lucide-react"
import { affiliateAPI, AffiliatePartner, AffiliateStats } from "@/lib/affiliate-api"

interface AffiliatePageClientProps {
  countryCode: string
}

export default function AffiliatePageClient({ countryCode }: AffiliatePageClientProps) {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [partner, setPartner] = useState<AffiliatePartner | null>(null)
  const [stats, setStats] = useState<AffiliateStats | null>(null)
  const [activeTab, setActiveTab] = useState("login")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [emailCheckLoading, setEmailCheckLoading] = useState(false)
  const [emailExists, setEmailExists] = useState<boolean | null>(null)
  const [emailCheckTimeout, setEmailCheckTimeout] = useState<NodeJS.Timeout | null>(null)

  // 表單狀態
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  })

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    website: ""
  })

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const isAuth = await affiliateAPI.isAuthenticated()
      if (isAuth) {
        const partnerData = await affiliateAPI.getProfile()
        setPartner(partnerData)
        setIsLoggedIn(true)
        
        const statsData = await affiliateAPI.getPartnerStats(partnerData.id)
        setStats(statsData)
      }
    } catch (error) {
      console.error('認證檢查失敗:', error)
      setIsLoggedIn(false)
    }
  }

  const checkEmailExists = async (email: string) => {
    if (!email || !email.includes('@')) {
      setEmailExists(null)
      return
    }

    // 清除之前的 timeout
    if (emailCheckTimeout) {
      clearTimeout(emailCheckTimeout)
    }

    // 設置新的延遲檢查
    const timeout = setTimeout(async () => {
      setEmailCheckLoading(true)
      try {
        const response = await affiliateAPI.checkEmailExists(email)
        setEmailExists(response.exists)
      } catch (error) {
        console.error('檢查電子郵件失敗:', error)
        setEmailExists(null)
      } finally {
        setEmailCheckLoading(false)
      }
    }, 500)

    setEmailCheckTimeout(timeout)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await affiliateAPI.login(loginForm.email, loginForm.password)
      
      if (result.success && result.partner) {
        setPartner(result.partner)
        setIsLoggedIn(true)
        setSuccess("登入成功！")
        
        // 載入統計資料
        const statsData = await affiliateAPI.getPartnerStats(result.partner.id)
        setStats(statsData)
      } else {
        setError(result.message || "登入失敗")
      }
    } catch (error: any) {
      setError(error.message || "登入過程中發生錯誤")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (registerForm.password !== registerForm.confirmPassword) {
      setError("密碼確認不一致")
      return
    }

    if (emailExists) {
      setError("此電子郵件已被使用")
      return
    }

    setLoading(true)
    setError("")

    try {
      const result = await affiliateAPI.register({
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        phone: registerForm.phone,
        website: registerForm.website
      })
      
      if (result.success && result.partner) {
        setPartner(result.partner)
        setIsLoggedIn(true)
        setSuccess(result.message || "註冊成功！")
        
        // 載入統計資料
        const statsData = await affiliateAPI.getPartnerStats(result.partner.id)
        setStats(statsData)
      } else {
        setError(result.message || "註冊失敗")
      }
    } catch (error: any) {
      setError(error.message || "註冊過程中發生錯誤")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await affiliateAPI.logout()
      setIsLoggedIn(false)
      setPartner(null)
      setStats(null)
      setSuccess("已成功登出")
    } catch (error) {
      console.error('登出失敗:', error)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setSuccess("連結已複製到剪貼簿！")
    } catch (error) {
      console.error('複製失敗:', error)
      setError("複製失敗，請手動複製")
    }
  }

  // 成功/錯誤訊息自動消失
  useEffect(() => {
    if (success) {
      const timeout = setTimeout(() => setSuccess(""), 3000)
      return () => clearTimeout(timeout)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => setError(""), 5000)
      return () => clearTimeout(timeout)
    }
  }, [error])

  if (isLoggedIn && partner) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {(success || error) && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg max-w-sm ${
            success ? 'bg-green-100 text-green-700 border border-green-300' : 
            'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {success || error}
          </div>
        )}

        {/* 手機版側邊欄覆蓋層 */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* 側邊導航 */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-auto lg:shadow-none lg:border-r ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div className="flex items-center justify-between h-16 px-6 bg-blue-600 text-white">
            <h1 className="text-xl font-bold">聯盟夥伴</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <nav className="mt-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                  {partner.name.charAt(0)}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{partner.name}</p>
                  <p className="text-xs text-gray-500">{partner.email}</p>
                </div>
              </div>
            </div>

            <div className="px-4 mt-6 space-y-2">
              <Link
                href={`/${countryCode}/affiliate`}
                className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Home className="w-5 h-5 mr-3" />
                主控台
              </Link>
              <Link
                href={`/${countryCode}/affiliate/earnings`}
                className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              >
                <DollarSign className="w-5 h-5 mr-3" />
                收益報告
              </Link>
              <Link
                href={`/${countryCode}/affiliate/tools`}
                className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Target className="w-5 h-5 mr-3" />
                推廣工具
              </Link>
              <Link
                href={`/${countryCode}/affiliate/settings`}
                className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Settings className="w-5 h-5 mr-3" />
                帳戶設定
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                登出
              </button>
            </div>
          </nav>
        </div>

        {/* 主要內容區域 */}
        <div className="flex-1 flex flex-col">
          {/* 頂部導航列 */}
          <div className="bg-white shadow-sm border-b lg:hidden">
            <div className="flex items-center justify-between h-16 px-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-gray-600 hover:text-gray-900"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">聯盟夥伴中心</h1>
              <div></div>
            </div>
          </div>

          {/* 內容區域 */}
          <div className="flex-1 p-6 overflow-auto">
            {/* 歡迎區塊 */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-2">歡迎回來，{partner.name}！</h2>
              <p className="text-blue-100">準備好開始賺取佣金了嗎？查看您的最新統計數據和推廣工具。</p>
            </div>

            {/* 統計卡片 */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-md">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">總推薦人數</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalReferrals}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-md">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">總佣金</p>
                      <p className="text-2xl font-bold text-gray-900">NT$ {stats.totalCommissions.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-md">
                      <TrendingUp className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">本月佣金</p>
                      <p className="text-2xl font-bold text-gray-900">NT$ {stats.monthlyCommissions.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-md">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">轉換率</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.conversionRate.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 推薦連結區塊 */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <LinkIcon className="w-5 h-5 mr-2 text-blue-600" />
                您的推薦連結
              </h3>
              <div className="bg-gray-50 rounded-md p-4 flex items-center justify-between">
                <code className="text-sm text-gray-800 bg-white px-3 py-2 rounded border flex-1 mr-4">
                  {partner.referral_link}
                </code>
                <UnifiedButton
                  size="sm"
                  onClick={() => copyToClipboard(partner.referral_link)}
                  className="flex-shrink-0"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  複製
                </UnifiedButton>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                分享這個連結來推薦新客戶，您將獲得 {(partner.commission_rate * 100).toFixed(0)}% 的佣金！
              </p>
            </div>

            {/* 快速動作 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-blue-100 rounded-md">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 ml-3">查看收益</h3>
                </div>
                <p className="text-gray-600 mb-4">檢視您的詳細收益報告和佣金歷史</p>
                <Link href={`/${countryCode}/affiliate/earnings`}>
                  <UnifiedButton size="sm" className="w-full">
                    查看報告
                  </UnifiedButton>
                </Link>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-green-100 rounded-md">
                    <Target className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 ml-3">推廣工具</h3>
                </div>
                <p className="text-gray-600 mb-4">獲取橫幅廣告、文案和其他推廣素材</p>
                <Link href={`/${countryCode}/affiliate/tools`}>
                  <UnifiedButton size="sm" className="w-full">
                    獲取工具
                  </UnifiedButton>
                </Link>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-purple-100 rounded-md">
                    <Settings className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 ml-3">帳戶設定</h3>
                </div>
                <p className="text-gray-600 mb-4">更新您的個人資料和付款資訊</p>
                <Link href={`/${countryCode}/affiliate/settings`}>
                  <UnifiedButton size="sm" className="w-full">
                    前往設定
                  </UnifiedButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 登入/註冊界面
  return (
    <div className="min-h-screen bg-gray-50">
      {(success || error) && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg max-w-sm ${
          success ? 'bg-green-100 text-green-700 border border-green-300' : 
          'bg-red-100 text-red-700 border border-red-300'
        }`}>
          {success || error}
        </div>
      )}

      {/* 頁首 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">聯盟夥伴計劃</h1>
            <p className="text-gray-600 mt-2">加入我們的聯盟計劃，開始賺取佣金</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Tab 切換 */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("login")}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === "login" 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <LogIn className="w-4 h-4 inline mr-2" />
                登入
              </button>
              <button
                onClick={() => setActiveTab("register")}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === "register" 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <UserPlus className="w-4 h-4 inline mr-2" />
                註冊
              </button>
            </div>
          </div>

          {/* 登入表單 */}
          {activeTab === "login" && (
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
                夥伴登入
              </h2>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    電子郵件
                  </label>
                  <input
                    type="email"
                    required
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    密碼
                  </label>
                  <input
                    type="password"
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                  />
                </div>

                <UnifiedButton
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      登入中...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      登入
                    </>
                  )}
                </UnifiedButton>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setActiveTab("register")}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  還沒有帳戶？立即註冊
                </button>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>測試帳號：</strong><br/>
                  電子郵件：affiliate@example.com<br/>
                  密碼：password
                </p>
              </div>
            </div>
          )}

          {/* 註冊表單 */}
          {activeTab === "register" && (
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
                加入聯盟
              </h2>

              <form onSubmit={handleRegister} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    姓名 *
                  </label>
                  <input
                    type="text"
                    required
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="您的姓名"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    電子郵件 *
                  </label>
                  <input
                    type="email"
                    required
                    value={registerForm.email}
                    onChange={(e) => {
                      const email = e.target.value
                      setRegisterForm(prev => ({ ...prev, email }))
                      checkEmailExists(email)
                    }}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      emailExists === true 
                        ? 'border-red-300 bg-red-50' 
                        : emailExists === false 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-300'
                    }`}
                    placeholder="your@email.com"
                  />
                  {emailCheckLoading && (
                    <p className="text-sm text-gray-500 mt-1">檢查中...</p>
                  )}
                  {emailExists === true && (
                    <p className="text-sm text-red-600 mt-1">此電子郵件已被使用</p>
                  )}
                  {emailExists === false && (
                    <p className="text-sm text-green-600 mt-1">電子郵件可使用</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    密碼 *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="至少 6 個字符"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    確認密碼 *
                  </label>
                  <input
                    type="password"
                    required
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      registerForm.password && registerForm.confirmPassword && 
                      registerForm.password !== registerForm.confirmPassword
                        ? 'border-red-300' 
                        : 'border-gray-300'
                    }`}
                    placeholder="重複輸入密碼"
                  />
                  {registerForm.password && registerForm.confirmPassword && 
                   registerForm.password !== registerForm.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">密碼不一致</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    電話號碼
                  </label>
                  <input
                    type="tel"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="09xxxxxxxx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    網站/部落格
                  </label>
                  <input
                    type="url"
                    value={registerForm.website}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://your-website.com"
                  />
                </div>

                <UnifiedButton
                  type="submit"
                  disabled={loading || emailExists === true || 
                           (registerForm.password && registerForm.confirmPassword && 
                            registerForm.password !== registerForm.confirmPassword) || false}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      註冊中...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      建立帳戶
                    </>
                  )}
                </UnifiedButton>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setActiveTab("login")}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  已有帳戶？立即登入
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
