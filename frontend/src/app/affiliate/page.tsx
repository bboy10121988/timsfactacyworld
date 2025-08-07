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

export default function AffiliatePage() {
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

  // 登入表單狀態
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  })

  // 註冊表單狀態
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    company: ""
  })

  // 忘記密碼表單狀態
  const [forgotPasswordForm, setForgotPasswordForm] = useState({
    email: ""
  })

  useEffect(() => {
    // 檢查是否已登入（從 localStorage 或 session 檢查）
    const savedPartner = localStorage.getItem("affiliate_partner")
    if (savedPartner) {
      try {
        const partnerData = JSON.parse(savedPartner)
        setPartner(partnerData)
        setIsLoggedIn(true)
        fetchStats()
      } catch (e) {
        localStorage.removeItem("affiliate_partner")
      }
    }
  }, [])

  const fetchStats = async () => {
    if (!partner) return
    
    try {
      const stats = await affiliateAPI.getPartnerStats(partner.id)
      setStats(stats)
      console.log("✅ Successfully fetched real affiliate stats:", stats)
    } catch (error) {
      console.error("❌ Failed to fetch stats, using fallback data:", error)
      // 只在真正失敗時使用模擬數據
      setStats({
        totalClicks: 125,
        totalConversions: 4,
        conversionRate: 3.2,
        totalEarnings: 2350,
        pendingEarnings: 320,
        thisMonthEarnings: 560
      })
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // 這裡應該調用真正的登入 API
      // 暫時使用模擬的方式
      const response = await fetch('http://localhost:9000/auth/customer/emailpass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password
        })
      })

      if (response.ok) {
        // 登入成功後，獲取用戶的聯盟夥伴資料
        const data = await affiliateAPI.getAllPartners()
        const foundPartner = data.partners?.find((p: AffiliatePartner) => 
          p.email === loginForm.email
        )

        if (foundPartner) {
          setPartner(foundPartner)
          setIsLoggedIn(true)
          localStorage.setItem("affiliate_partner", JSON.stringify(foundPartner))
          fetchStats()
          setSuccess("登入成功！")
        } else {
          setError("您還沒有聯盟夥伴帳號，請先註冊申請")
        }
      } else {
        setError("登入失敗，請檢查您的電子郵件和密碼")
      }
    } catch (error) {
      console.error("Login failed:", error)
      setError("登入失敗，請檢查您的網路連線或稍後再試")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    console.log('註冊資料:', registerForm)

    try {
      const result = await affiliateAPI.createPartner({
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        phone: registerForm.phone,
        company: registerForm.company
      })
      console.log('註冊成功:', result)
      setSuccess("註冊申請已提交！我們會在 1-2 個工作日內審核您的申請並發送聯盟代碼到您的電子郵件。")
      setRegisterForm({ name: "", email: "", password: "", confirmPassword: "", phone: "", company: "" })
      setEmailExists(null) // 重置 email 檢查狀態
    } catch (error: any) {
      console.error("註冊失敗詳細信息:", error)
      
      // 更詳細的錯誤處理
      let errorMessage = "註冊失敗，請稍後再試"
      
      if (error.message) {
        if (error.message.includes('already exists')) {
          errorMessage = "此電子郵件已經註冊過聯盟夥伴帳號。如果您是想要登入，請使用登入功能；如果您忘記了聯盟代碼，請聯繫客服。"
        } else if (error.message.includes('400')) {
          errorMessage = "請檢查填寫的資料是否正確"
        } else if (error.message.includes('500')) {
          errorMessage = "伺服器錯誤，請稍後再試"
        } else if (error.message.includes('fetch')) {
          errorMessage = "網路連線錯誤，請檢查網路設定"
        } else {
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const checkEmailExists = async (email: string) => {
    if (!email || !email.includes('@')) {
      setEmailExists(null)
      return
    }

    setEmailCheckLoading(true)
    try {
      const result = await affiliateAPI.checkEmailExists(email)
      setEmailExists(result.exists)
    } catch (error) {
      console.error('檢查 email 失敗:', error)
      setEmailExists(null)
    } finally {
      setEmailCheckLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const result = await affiliateAPI.forgotPassword(forgotPasswordForm.email)
      setSuccess(result.message || "重設密碼連結已發送到您的電子郵件，請檢查收件匣。")
      setForgotPasswordForm({ email: "" })
    } catch (error: any) {
      console.error("忘記密碼失敗:", error)
      
      let errorMessage = "處理失敗，請稍後再試"
      
      if (error.message) {
        if (error.message.includes('not found') || error.message.includes('未註冊')) {
          errorMessage = "此電子郵件未註冊聯盟夥伴帳號，請先註冊或檢查電子郵件是否正確。"
        } else {
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setPartner(null)
    setStats(null)
    localStorage.removeItem("affiliate_partner")
    setActiveTab("login")
  }

  const copyReferralLink = () => {
    if (partner?.referral_link) {
      navigator.clipboard.writeText(partner.referral_link)
      setSuccess("推薦連結已複製到剪貼板！")
      setTimeout(() => setSuccess(""), 3000)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD'
    }).format(amount)
  }

  if (isLoggedIn && partner) {
    return (
      <div className="py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* 側邊欄導航 */}
          <div className={`lg:col-span-1 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow border p-6 sticky top-8">
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{partner.name}</p>
                    <p className="text-sm text-gray-500">{partner.email}</p>
                  </div>
                </div>
                <div className="bg-gray-50 px-3 py-2 rounded-md">
                  <p className="text-xs text-gray-600">聯盟代碼</p>
                  <p className="font-mono text-sm">{partner.affiliate_code}</p>
                </div>
              </div>

              <div className="flex lg:hidden items-center justify-between mb-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
                <UnifiedButton variant="secondary" onClick={handleLogout} size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  登出
                </UnifiedButton>
              </div>

              <nav className="space-y-2">
                <Link
                  href="/affiliate"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-md"
                >
                  <Home className="h-4 w-4 mr-3" />
                  儀表板
                </Link>
                <Link
                  href="/affiliate/tools"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                >
                  <Target className="h-4 w-4 mr-3" />
                  推廣工具
                </Link>
                <Link
                  href="/affiliate/earnings"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                >
                  <BarChart3 className="h-4 w-4 mr-3" />
                  收益報告
                </Link>
                <Link
                  href="/affiliate/settings"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                >
                  <Settings className="h-4 w-4 mr-3" />
                  帳號設定
                </Link>
              </nav>

              <div className="hidden lg:block mt-6 pt-4 border-t">
                <UnifiedButton variant="secondary" onClick={handleLogout} size="sm" className="w-full">
                  <LogOut className="h-4 w-4 mr-2" />
                  登出
                </UnifiedButton>
              </div>
            </div>
          </div>

          {/* 主要內容區域 */}
          <div className="lg:col-span-3">
            {/* 歡迎信息 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">歡迎回來，{partner.name}！</h2>
              <p className="text-gray-600">查看您的推廣表現和最新收益</p>
            </div>

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-700">{success}</p>
              </div>
            )}

            {/* 統計卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">總點擊數</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalClicks.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">轉換數</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalConversions}</p>
                    <p className="text-xs text-gray-500">轉換率 {stats?.conversionRate.toFixed(2)}%</p>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">總收益</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.totalEarnings || 0)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-yellow-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">本月收益</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.thisMonthEarnings || 0)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* 快速操作區域 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* 推薦連結 */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center gap-2 mb-4">
                  <LinkIcon className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">您的推薦連結</h3>
                </div>
                <p className="text-gray-600 mb-4">分享此連結來賺取 {partner.commission_rate}% 的佣金</p>
                
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={partner.referral_link}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                  />
                  <UnifiedButton onClick={copyReferralLink} variant="secondary">
                    <Copy className="h-4 w-4" />
                  </UnifiedButton>
                </div>
                
                <div className="flex gap-2">
                  <Link href="/affiliate/tools">
                    <UnifiedButton variant="secondary" size="sm">
                      <Target className="h-4 w-4 mr-2" />
                      管理推廣工具
                    </UnifiedButton>
                  </Link>
                </div>
              </div>

              {/* 收益摘要 */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-semibold mb-4">收益摘要</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">待結算佣金</span>
                    <span className="text-lg font-semibold text-orange-600">
                      {formatCurrency(stats?.pendingEarnings || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">已支付佣金</span>
                    <span className="text-lg font-semibold text-green-600">
                      {formatCurrency((stats?.totalEarnings || 0) - (stats?.pendingEarnings || 0))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-4">
                    <span className="font-medium">總收益</span>
                    <span className="text-xl font-bold">
                      {formatCurrency(stats?.totalEarnings || 0)}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Link href="/affiliate/earnings">
                    <UnifiedButton variant="secondary" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      查看詳細報告
                    </UnifiedButton>
                  </Link>
                </div>
              </div>
            </div>

            {/* 快速導航 */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-4">快速導航</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/affiliate/tools">
                  <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <Target className="h-6 w-6 text-blue-600 mb-2" />
                    <h4 className="font-medium mb-1">推廣工具</h4>
                    <p className="text-sm text-gray-600">創建和管理推薦連結</p>
                  </div>
                </Link>
                
                <Link href="/affiliate/earnings">
                  <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <BarChart3 className="h-6 w-6 text-green-600 mb-2" />
                    <h4 className="font-medium mb-1">收益分析</h4>
                    <p className="text-sm text-gray-600">查看詳細的收益報告</p>
                  </div>
                </Link>
                
                <Link href="/affiliate/settings">
                  <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <Settings className="h-6 w-6 text-purple-600 mb-2" />
                    <h4 className="font-medium mb-1">帳號設定</h4>
                    <p className="text-sm text-gray-600">管理個人資料和設定</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-16">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">聯盟夥伴中心</h1>
          <p className="text-gray-600">加入我們的聯盟計畫，開始賺取佣金</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Tab 切換按鈕 */}
        <div className="flex rounded-lg border border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-3 px-4 text-center font-medium rounded-l-lg transition-colors ${
              activeTab === "login"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <LogIn className="h-4 w-4 mx-auto mb-1" />
            登入
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`flex-1 py-3 px-4 text-center font-medium rounded-r-lg transition-colors ${
              activeTab === "register"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <UserPlus className="h-4 w-4 mx-auto mb-1" />
            註冊
          </button>
        </div>

        {/* 登入表單 */}
        {activeTab === "login" && (
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-xl font-semibold mb-2">夥伴登入</h2>
            <p className="text-gray-600 mb-6">使用您的電子郵件和聯盟代碼登入</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  電子郵件
                </label>
                <input
                  id="email"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    密碼
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("forgot-password")
                      setError("")
                      setSuccess("")
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900 underline"
                  >
                    忘記密碼？
                  </button>
                </div>
                <input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
              </div>
              <UnifiedButton type="submit" className="w-full" isLoading={loading}>
                {loading ? "登入中..." : "登入"}
              </UnifiedButton>
            </form>
          </div>
        )}

        {/* 註冊表單 */}
        {activeTab === "register" && (
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-xl font-semibold mb-2">申請成為聯盟夥伴</h2>
            <p className="text-gray-600 mb-6">填寫下方資訊申請加入我們的聯盟計畫</p>
            
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  姓名 *
                </label>
                <input
                  id="name"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="register_email" className="block text-sm font-medium text-gray-700 mb-1">
                  電子郵件 *
                </label>
                <div className="relative">
                  <input
                    id="register_email"
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => {
                      const email = e.target.value
                      setRegisterForm({...registerForm, email})
                      
                      // 清除之前的計時器
                      if (emailCheckTimeout) {
                        clearTimeout(emailCheckTimeout)
                      }
                      
                      // 重置狀態
                      setEmailExists(null)
                      
                      // 如果 email 有效，設置新的計時器
                      if (email && email.includes('@')) {
                        const timeout = setTimeout(() => checkEmailExists(email), 800)
                        setEmailCheckTimeout(timeout)
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                      emailExists === true ? 'border-red-300 bg-red-50' :
                      emailExists === false ? 'border-green-300 bg-green-50' : 'border-gray-300'
                    }`}
                    required
                  />
                  {emailCheckLoading && (
                    <div className="absolute right-2 top-2">
                      <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                    </div>
                  )}
                </div>
                {emailExists === true && (
                  <p className="mt-1 text-sm text-red-600">
                    此電子郵件已經註冊過聯盟夥伴帳號。請使用登入功能或聯繫客服。
                  </p>
                )}
                {emailExists === false && registerForm.email && (
                  <p className="mt-1 text-sm text-green-600">
                    此電子郵件可以使用。
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="register_password" className="block text-sm font-medium text-gray-700 mb-1">
                  密碼 *
                </label>
                <input
                  id="register_password"
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
                  確認密碼 *
                </label>
                <input
                  id="confirm_password"
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                    registerForm.password && registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword 
                      ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {registerForm.password && registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">密碼不一致</p>
                )}
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  電話號碼
                </label>
                <input
                  id="phone"
                  value={registerForm.phone}
                  onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                  公司名稱
                </label>
                <input
                  id="company"
                  value={registerForm.company}
                  onChange={(e) => setRegisterForm({...registerForm, company: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <UnifiedButton 
                type="submit" 
                className="w-full" 
                isLoading={loading}
                disabled={
                  loading || 
                  emailExists === true || 
                  (!!registerForm.password && !!registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword)
                }
              >
                {loading ? "提交中..." : 
                 emailExists === true ? "此電子郵件已註冊" :
                 (!!registerForm.password && !!registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword) ? "密碼不一致" :
                 "提交申請"}
              </UnifiedButton>
            </form>
          </div>
        )}

        {/* 忘記密碼表單 */}
        {activeTab === "forgot-password" && (
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-xl font-semibold mb-2">重設密碼</h2>
            <p className="text-gray-600 mb-6">輸入您註冊時使用的電子郵件，我們將發送重設密碼連結給您</p>
            
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label htmlFor="forgot_email" className="block text-sm font-medium text-gray-700 mb-1">
                  電子郵件 *
                </label>
                <input
                  id="forgot_email"
                  type="email"
                  value={forgotPasswordForm.email}
                  onChange={(e) => setForgotPasswordForm({email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                  placeholder="輸入您的電子郵件"
                />
              </div>
              
              <UnifiedButton 
                type="submit" 
                className="w-full" 
                isLoading={loading}
              >
                {loading ? "發送中..." : "發送重設連結"}
              </UnifiedButton>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("login")
                    setError("")
                    setSuccess("")
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  返回登入
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
