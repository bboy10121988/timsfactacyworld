"use client"

import { Button } from "@medusajs/ui"

export default function ButtonTestPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-8">按鈕測試頁面</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 基本按鈕 */}
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-4">基本按鈕</h2>
          <div className="space-y-2">
            <Button>預設按鈕</Button>
            <Button variant="primary">主要按鈕</Button>
            <Button variant="secondary">次要按鈕</Button>
            <Button variant="danger">危險按鈕</Button>
            <Button variant="transparent">透明按鈕</Button>
          </div>
        </div>

        {/* 不同尺寸 */}
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-4">不同尺寸</h2>
          <div className="space-y-2">
            <Button size="small">小按鈕</Button>
            <Button size="base">基本按鈕</Button>
            <Button size="large">大按鈕</Button>
          </div>
        </div>

        {/* 載入狀態 */}
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-4">載入狀態</h2>
          <div className="space-y-2">
            <Button isLoading>載入中...</Button>
            <Button isLoading variant="primary">主要載入</Button>
            <Button isLoading variant="secondary">次要載入</Button>
          </div>
        </div>

        {/* 停用狀態 */}
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-4">停用狀態</h2>
          <div className="space-y-2">
            <Button disabled>停用按鈕</Button>
            <Button disabled variant="primary">停用主要</Button>
            <Button disabled variant="secondary">停用次要</Button>
          </div>
        </div>

        {/* 全寬度 */}
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-4">全寬度</h2>
          <div className="space-y-2">
            <Button className="w-full">全寬度按鈕</Button>
            <Button className="w-full" variant="primary">全寬度主要</Button>
          </div>
        </div>

        {/* 原生 HTML 按鈕對比 */}
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-4">原生 HTML 按鈕</h2>
          <div className="space-y-2">
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              原生按鈕
            </button>
            <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
              原生灰色
            </button>
            <button 
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={() => alert('原生按鈕點擊')}
            >
              原生點擊測試
            </button>
          </div>
        </div>

      </div>

      {/* 功能測試 */}
      <div className="mt-8 p-4 border rounded">
        <h2 className="text-lg font-semibold mb-4">功能測試</h2>
        <div className="space-x-2">
          <Button onClick={() => alert('Medusa UI 按鈕點擊成功！')}>
            點擊測試
          </Button>
          <Button 
            variant="primary" 
            onClick={() => console.log('控制台輸出測試')}
          >
            控制台測試
          </Button>
          <Button 
            variant="secondary"
            onMouseEnter={() => console.log('滑鼠進入')}
            onMouseLeave={() => console.log('滑鼠離開')}
          >
            滑鼠事件測試
          </Button>
        </div>
      </div>

      {/* 表單中的按鈕 */}
      <div className="mt-8 p-4 border rounded">
        <h2 className="text-lg font-semibold mb-4">表單按鈕</h2>
        <form onSubmit={(e) => { e.preventDefault(); alert('表單提交'); }}>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="輸入文字" 
              className="w-full p-2 border rounded"
            />
            <div className="space-x-2">
              <Button type="submit">提交</Button>
              <Button type="button" variant="secondary">取消</Button>
              <Button type="reset" variant="danger">重置</Button>
            </div>
          </div>
        </form>
      </div>

    </div>
  )
}
