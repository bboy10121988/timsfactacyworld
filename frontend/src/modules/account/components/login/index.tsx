"use client"

import { loginWithEmailPassword } from "@lib/data/google-auth"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import GoogleLoginButton from "@modules/account/components/google-login-button"
import Input from "@modules/common/components/input"
import { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const result = await loginWithEmailPassword(email, password)
    
    if (result.success) {
      // 登入成功，重新整理頁面
      window.location.reload()
    } else {
      setMessage(result.error || "登入失敗")
      setIsLoading(false)
    }
  }

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center mx-4"
      data-testid="login-page"
    >
      <h1 className="text-large-semi uppercase mb-6">歡迎回來</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        登入以享受更好的購物體驗。
      </p>
      
      {/* Google 登入按鈕 */}
      <div className="w-full mb-6">
        <GoogleLoginButton />
      </div>
      
      {/* 分隔線 */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">或</span>
        </div>
      </div>
      
      <form className="w-full" onSubmit={handleSubmit}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="電子郵件"
            name="email"
            type="email"
            title="請輸入有效的電子郵件地址。"
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <Input
            label="密碼"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={message} data-testid="login-error-message" />
        <button
          type="submit"
          disabled={isLoading}
          data-testid="sign-in-button"
          className="w-full mt-6 px-4 py-3 bg-gray-900 text-white text-small-regular font-medium rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              登入中...
            </div>
          ) : (
            "登入"
          )}
        </button>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        還不是會員？{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="underline"
          data-testid="register-button"
        >
          立即加入
        </button>
      </span>
    </div>
  )
}

export default Login
