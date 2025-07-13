import Link from 'next/link'

export default function CMSIndexPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              🎉 Sanity CMS 已成功整合到前端！
            </h1>
            
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      整合成功完成
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      Sanity Studio 現在可以通過 <code className="bg-green-100 px-1 rounded">/cms</code> 路由訪問
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    🎨 訪問 CMS
                  </h3>
                  <p className="text-gray-600 mb-4">
                    進入 Sanity Studio 管理內容
                  </p>
                  <Link 
                    href="/cms"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    打開 CMS
                  </Link>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    🏠 返回首頁
                  </h3>
                  <p className="text-gray-600 mb-4">
                    返回電商網站首頁
                  </p>
                  <Link 
                    href="/"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    返回首頁
                  </Link>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  ✨ 整合優勢
                </h3>
                <ul className="list-disc list-inside text-blue-800 space-y-1">
                  <li>統一部署：只需要部署一個應用</li>
                  <li>共享依賴：減少重複的套件和資源</li>
                  <li>統一域名：CMS 與前端在同一域名下</li>
                  <li>簡化維護：減少服務器配置複雜度</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                  🔧 技術實現
                </h3>
                <div className="text-yellow-800 space-y-2">
                  <p><strong>路由結構：</strong> <code>/cms/[[...tool]]</code></p>
                  <p><strong>Next.js 頁面：</strong> App Router 支持</p>
                  <p><strong>依賴管理：</strong> 統一在前端 package.json 中</p>
                  <p><strong>配置文件：</strong> 共享 Sanity 配置</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
