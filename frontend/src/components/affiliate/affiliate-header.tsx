"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, Home, BarChart3, Settings, Target } from "lucide-react"

interface AffiliateHeaderProps {
  title?: string
  showNavigation?: boolean
  className?: string
}

export default function AffiliateHeader({ 
  title = "聯盟夥伴中心",
  showNavigation = true,
  className = ""
}: AffiliateHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigationItems = [
    { name: "首頁", href: "/affiliate", icon: Home },
    { name: "收益報告", href: "/affiliate/earnings", icon: BarChart3 },
    { name: "行銷工具", href: "/affiliate/tools", icon: Target },
    { name: "帳戶設定", href: "/affiliate/settings", icon: Settings },
  ]

  return (
    <header className={`bg-white shadow-sm border-b border-gray-200 ${className}`}>
      {/* 主要標題區域 */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {title}
              </h1>
              <p className="text-gray-300 text-sm md:text-base">
                加入我們的聯盟計畫，開始賺取佣金
              </p>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center space-x-4 text-white/80">
                <div className="text-right">
                  <div className="text-sm">聯盟佣金率</div>
                  <div className="text-lg font-semibold">10%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 導覽區域 */}
      {showNavigation && (
        <div className="bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* 桌面導覽 */}
            <div className="hidden md:flex">
              <nav className="flex space-x-8" aria-label="聯盟夥伴導覽">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center py-4 px-1 text-sm font-medium text-gray-700 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300 transition-colors"
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* 手機導覽按鈕 */}
            <div className="md:hidden flex justify-between items-center py-3">
              <span className="text-sm font-medium text-gray-700">選單</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                aria-expanded="false"
              >
                <span className="sr-only">開啟主選單</span>
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* 手機導覽選單 */}
            {mobileMenuOpen && (
              <div className="md:hidden border-t border-gray-200">
                <nav className="py-3 space-y-1" aria-label="手機聯盟夥伴導覽">
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center py-3 px-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        {item.name}
                      </Link>
                    )
                  })}
                </nav>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
