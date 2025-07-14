"use client"

import { useActionState } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import GoogleLoginButton from "@modules/account/components/google-login-button"
import { signup } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, null)

  return (
    <div
      className="max-w-sm flex flex-col items-center mx-4"
      data-testid="register-page"
    >
      <h1 className="text-large-semi uppercase mb-6">
        成為會員
      </h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-4">
        建立您的會員資料，享受更好的購物體驗。
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
      
      <form className="w-full flex flex-col" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="名字"
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label="姓氏"
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
          <Input
            label="電子郵件"
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label="電話"
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <Input
            label="密碼"
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={message} data-testid="register-error" />
        <span className="text-center text-ui-fg-base text-small-regular mt-6">
          建立帳戶即表示您同意我們的{" "}
          <LocalizedClientLink
            href="/content/privacy-policy"
            className="underline"
          >
            隱私政策
          </LocalizedClientLink>{" "}
          和{" "}
          <LocalizedClientLink
            href="/content/terms-of-use"
            className="underline"
          >
            使用條款
          </LocalizedClientLink>
          。
        </span>
        <SubmitButton className="w-full mt-6" data-testid="register-button">
          註冊
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        已經是會員？{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          立即登入
        </button>
      </span>
    </div>
  )
}

export default Register
