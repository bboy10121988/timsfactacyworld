"use client"

import React, { useState } from 'react'

interface LogisticsSelectionProps {
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

export default function LogisticsSelection({ onSuccess, onError }: LogisticsSelectionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    goodsAmount: 500,
    goodsName: '測試商品',
    senderName: '王小明',
    senderZipCode: '100',
    senderAddress: '台北市中正區重慶南路一段122號',
    isCollection: 'N',
    temperature: '0001',
    specification: '0001',
    scheduledPickupTime: '4',
    enableSelectDeliveryTime: 'N',
    receiverName: '',
    receiverCellPhone: '',
    receiverPhone: '',
    receiverAddress: '',
    remark: '',
    eshopMemberID: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log('📝 發送物流選擇請求:', formData)

      const response = await fetch('/api/ecpay/logistics/selection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      // 檢查回應類型
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('text/html')) {
        // HTML 回應 - 在新視窗開啟物流選擇頁面
        const html = await response.text()
        const newWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes,resizable=yes')
        
        if (newWindow) {
          newWindow.document.write(html)
          newWindow.document.close()
          
          // 監聽新視窗關閉事件
          const checkClosed = setInterval(() => {
            if (newWindow.closed) {
              clearInterval(checkClosed)
              console.log('✅ 物流選擇視窗已關閉')
            }
          }, 1000)
          
          onSuccess?.({ message: '物流選擇頁面已開啟', window: newWindow })
        } else {
          throw new Error('無法開啟新視窗，請檢查瀏覽器彈出視窗設定')
        }
      } else {
        // JSON 回應
        const result = await response.json()
        console.log('✅ 物流選擇回應:', result)
        
        if (result.success) {
          onSuccess?.(result)
        } else {
          throw new Error(result.message)
        }
      }

    } catch (error: any) {
      console.error('❌ 物流選擇錯誤:', error)
      onError?.(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // 監聽來自物流選擇頁面的回調
  React.useEffect(() => {
    // 檢查是否在瀏覽器環境
    if (typeof window === 'undefined') {
      return
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'LOGISTICS_SELECTED') {
        console.log('✅ 收到物流選擇結果:', event.data.data)
        onSuccess?.(event.data.data)
      }
    }

    // 設置全域回調函數
    ;(window as any).onLogisticsSelected = (data: any) => {
      console.log('✅ 收到物流選擇回調:', data)
      onSuccess?.(data)
    }

    window.addEventListener('message', handleMessage)
    
    return () => {
      window.removeEventListener('message', handleMessage)
      delete (window as any).onLogisticsSelected
    }
  }, [onSuccess])

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🚚 ECPay 物流選擇</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本資訊 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">基本資訊</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                商品金額 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="goodsAmount"
                value={formData.goodsAmount}
                onChange={handleInputChange}
                min="1"
                max="20000"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">範圍：1-20000 元</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                是否代收貨款
              </label>
              <select
                name="isCollection"
                value={formData.isCollection}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="N">否 (N)</option>
                <option value="Y">是 (Y) - 不會出現宅配選項</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              商品名稱 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="goodsName"
              value={formData.goodsName}
              onChange={handleInputChange}
              maxLength={50}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">不得包含特殊符號：^ ' ` ! @ # % & * + \ " &lt; &gt; | _ [ ]</p>
          </div>
        </div>

        {/* 寄件人資訊 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">寄件人資訊</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                寄件人姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="senderName"
                value={formData.senderName}
                onChange={handleInputChange}
                maxLength={10}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">4-10 個字元，不可包含數字和特殊符號</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                寄件人郵遞區號 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="senderZipCode"
                value={formData.senderZipCode}
                onChange={handleInputChange}
                maxLength={6}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              寄件人地址 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="senderAddress"
              value={formData.senderAddress}
              onChange={handleInputChange}
              maxLength={60}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 物流設定 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">物流設定</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">溫層</label>
              <select
                name="temperature"
                value={formData.temperature}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="0001">0001 - 常溫 (預設)</option>
                <option value="0002">0002 - 冷藏</option>
                <option value="0003">0003 - 冷凍 (支援 7-ELEVEN 冷凍店取)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">規格</label>
              <select
                name="specification"
                value={formData.specification}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="0001">0001 - 60cm (預設)</option>
                <option value="0002">0002 - 90cm</option>
                <option value="0003">0003 - 120cm</option>
                <option 
                  value="0004" 
                  disabled={formData.temperature === '0002' || formData.temperature === '0003'}
                >
                  0004 - 150cm {(formData.temperature === '0002' || formData.temperature === '0003') && '(冷藏/冷凍不可選)'}
                </option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">預定取件時段</label>
              <select
                name="scheduledPickupTime"
                value={formData.scheduledPickupTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">1 - 9~12點</option>
                <option value="2">2 - 12~17點</option>
                <option value="4">4 - 不限時</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">允許選擇送達時間</label>
              <select
                name="enableSelectDeliveryTime"
                value={formData.enableSelectDeliveryTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="N">N - 不允許 (預設)</option>
                <option value="Y">Y - 允許</option>
              </select>
            </div>
          </div>
        </div>

        {/* 收件人資訊 (可選) */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">收件人資訊 (可選預填)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">收件人姓名</label>
              <input
                type="text"
                name="receiverName"
                value={formData.receiverName}
                onChange={handleInputChange}
                maxLength={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">收件人手機</label>
              <input
                type="text"
                name="receiverCellPhone"
                value={formData.receiverCellPhone}
                onChange={handleInputChange}
                maxLength={10}
                pattern="09[0-9]{8}"
                placeholder="09xxxxxxxx"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">收件人電話</label>
              <input
                type="text"
                name="receiverPhone"
                value={formData.receiverPhone}
                onChange={handleInputChange}
                maxLength={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">會員 ID</label>
              <input
                type="text"
                name="eshopMemberID"
                value={formData.eshopMemberID}
                onChange={handleInputChange}
                maxLength={24}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">收件人地址</label>
            <input
              type="text"
              name="receiverAddress"
              value={formData.receiverAddress}
              onChange={handleInputChange}
              maxLength={60}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
            <textarea
              name="remark"
              value={formData.remark}
              onChange={handleInputChange}
              maxLength={60}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 提交按鈕 */}
        <div className="flex justify-center space-x-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '處理中...' : '開啟物流選擇頁面'}
          </button>
          
          <button
            type="button"
            onClick={() => {
              setFormData({
                goodsAmount: 500,
                goodsName: '測試商品',
                senderName: '王小明',
                senderZipCode: '100',
                senderAddress: '台北市中正區重慶南路一段122號',
                isCollection: 'N',
                temperature: '0001',
                specification: '0001',
                scheduledPickupTime: '4',
                enableSelectDeliveryTime: 'N',
                receiverName: '',
                receiverCellPhone: '',
                receiverPhone: '',
                receiverAddress: '',
                remark: '',
                eshopMemberID: ''
              })
            }}
            className="px-6 py-3 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            重設表單
          </button>
        </div>
      </form>
    </div>
  )
}
