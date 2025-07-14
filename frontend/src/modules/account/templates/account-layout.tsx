import React from "react"

import UnderlineLink from "@modules/common/components/interactive-link"

import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  return (
    <div className="flex-1 small:py-12 px-4" data-testid="account-page">
      <div className="flex-1 content-container h-full max-w-5xl mx-auto bg-white flex flex-col">
        {customer ? (
          // 用戶已登入：顯示側邊欄和內容的網格佈局
          <div className="grid grid-cols-1 small:grid-cols-[240px_1fr] py-12 gap-8">
            <div className="px-4">
              <AccountNav customer={customer} />
            </div>
            <div className="flex-1 px-4">{children}</div>
          </div>
        ) : (
          // 用戶未登入：置中顯示登入/註冊表單
          <div className="flex justify-center items-center py-12">
            <div className="w-full">{children}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AccountLayout
