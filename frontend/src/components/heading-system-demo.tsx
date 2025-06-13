import React from 'react'

// 示範如何使用新的全局標題樣式系統
const HeadingSystemDemo = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* 使用新的標題層級系統 */}
      <div className="section-container">
        <h1 className="h1">主標題 H1 - 全局樣式系統</h1>
        <p className="h2">這是副標題 H2 - 使用 Service Cards 的樣式結構</p>
      </div>

      {/* Blog Section 示範 */}
      <section className="bg-white p-8 rounded-lg shadow mb-8">
        <div className="text-center mb-8">
          <h2 className="h1">最新文章</h2>
          <p className="h2">探索我們的最新見解和專業知識</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 模擬 blog cards */}
          <div className="border rounded-lg p-6">
            <h3 className="h3 mb-3">文章標題</h3>
            <p className="h4 mb-4 text-gray-500">類別名稱</p>
            <p className="text-gray-700">文章摘要內容...</p>
          </div>
          
          <div className="border rounded-lg p-6">
            <h3 className="h3 mb-3">另一篇文章</h3>
            <p className="h4 mb-4 text-gray-500">技術分享</p>
            <p className="text-gray-700">技術文章摘要...</p>
          </div>
          
          <div className="border rounded-lg p-6">
            <h3 className="h3 mb-3">第三篇文章</h3>
            <p className="h4 mb-4 text-gray-500">設計思維</p>
            <p className="text-gray-700">設計相關內容...</p>
          </div>
        </div>
      </section>

      {/* 樣式說明 */}
      <section className="bg-gray-50 p-8 rounded-lg">
        <h2 className="h1 mb-6">標題層級系統說明</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="h3 mb-2">H1 主標題</h3>
            <p className="text-gray-700 mb-2">
              字體: Helvetica Neue, 字重: 300 (輕體), 間距: 0.2em
            </p>
            <p className="text-gray-700">
              大小: 30px (桌面 36px), 適用於頁面主標題和重要區塊標題
            </p>
          </div>
          
          <div>
            <h3 className="h3 mb-2">H2 副標題</h3>
            <p className="text-gray-700 mb-2">
              字體: Noto Sans TC, 顏色: 灰色 (#6B7280), 字重: 400
            </p>
            <p className="text-gray-700">
              大小: 16px, 適用於描述文字和副標題
            </p>
          </div>
          
          <div>
            <h3 className="h3 mb-2">H3 次級標題</h3>
            <p className="text-gray-700 mb-2">
              字體: Helvetica Neue, 字重: 400, 間距: 0.1em
            </p>
            <p className="text-gray-700">
              大小: 20px, 適用於文章內的主要段落標題
            </p>
          </div>
          
          <div>
            <h3 className="h3 mb-2">H4 小標題</h3>
            <p className="text-gray-700">
              字體: Noto Sans TC, 字重: 500 (中體), 大小: 18px
            </p>
            <p className="text-gray-700">
              適用於較小的標題和分類標籤
            </p>
          </div>
        </div>
      </section>

      {/* 向後兼容說明 */}
      <section className="bg-white p-8 rounded-lg shadow mt-8">
        <h2 className="h1 mb-6">向後兼容性</h2>
        
        <div className="text-left space-y-4">
          <p className="text-gray-700">
            為了確保現有組件繼續正常運作，我們保留了所有舊的樣式類別：
          </p>
          
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li><code className="bg-gray-100 px-2 py-1 rounded">.section-heading</code> - 保持與 h1 相同的樣式</li>
            <li><code className="bg-gray-100 px-2 py-1 rounded">.section-subheading</code> - 保持與 h2 相同的樣式</li>
            <li><code className="bg-gray-100 px-2 py-1 rounded">.section-header-container</code> - 與 section-container 相同</li>
          </ul>
          
          <p className="text-gray-700 mt-4">
            建議新組件使用 <code className="bg-gray-100 px-2 py-1 rounded">.h1</code>, 
            <code className="bg-gray-100 px-2 py-1 rounded">.h2</code> 等新的語義化類別名稱。
          </p>
        </div>
      </section>
    </div>
  )
}

export default HeadingSystemDemo
