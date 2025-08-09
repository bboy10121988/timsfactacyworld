import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Medusa Admin',
  description: 'Medusa 管理介面',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <div className="min-h-screen bg-gray-100">
          {/* 導航欄 */}
          <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <h1 className="text-xl font-bold text-gray-900">Medusa Admin</h1>
                  </div>
                  <div className="hidden md:ml-6 md:flex md:space-x-8">
                    <a
                      href="/app"
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      首頁
                    </a>
                    <a
                      href="/app/affiliate-management"
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      聯盟管理
                    </a>
                    <a
                      href="/app/affiliate-performance"
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      績效儀表板
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* 主內容 */}
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
