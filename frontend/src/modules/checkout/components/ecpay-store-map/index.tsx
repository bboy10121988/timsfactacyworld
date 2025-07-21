"use client"

import { useState } from "react"
import { Button } from "@medusajs/ui"
import { MapPin } from "@medusajs/icons"
import { toast } from "react-hot-toast"

type EcpayStoreMapProps = {
  cart: any
  onStoreSelected?: (storeInfo: any) => void
}

const EcpayStoreMap: React.FC<EcpayStoreMapProps> = ({ 
  cart, 
  onStoreSelected 
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleOpenStoreMap = async () => {
    setIsLoading(true)
    
    try {
      console.log('🗺️ 開啟綠界電子地圖選擇門市...')
      
      const response = await fetch('/api/ecpay/logistics/map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingMethod: '超商取貨', // 統一使用超商取貨
          cartId: cart?.id,
          extraData: { source: 'checkout' }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '無法開啟門市選擇地圖')
      }

      const data = await response.json()
      console.log('✅ 收到綠界電子地圖資料:', data)
      
      if (!data.html) {
        throw new Error('未收到電子地圖 HTML')
      }

      // 在新視窗開啟綠界電子地圖
      const mapWindow = window.open('', '_blank', 'width=1000,height=700,scrollbars=yes,resizable=yes')
      
      if (mapWindow) {
        mapWindow.document.write(data.html)
        mapWindow.document.close()
        
        // 監聽門市選擇完成事件（通常透過 postMessage 或 callback）
        const checkClosed = setInterval(() => {
          if (mapWindow.closed) {
            clearInterval(checkClosed)
            // 門市選擇完成後的處理
            toast.success('門市選擇視窗已關閉，請檢查是否已選擇門市')
          }
        }, 1000)
        
      } else {
        throw new Error('無法開啟門市選擇視窗，請檢查瀏覽器彈窗設定')
      }
      
    } catch (error) {
      console.error('❌ 開啟門市選擇地圖失敗:', error)
      toast.error(error instanceof Error ? error.message : '開啟門市選擇地圖失敗')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg" style={{ 
        backgroundColor: "var(--bg-secondary)", 
        borderColor: "var(--border-primary)" 
      }}>
        <h4 className="font-medium mb-2" style={{ color: "var(--text-primary)" }}>
          便利商店取貨門市選擇
        </h4>
        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          點擊下方按鈕開啟綠界電子地圖，可選擇 7-11、全家、萊爾富等各大便利商店門市
        </p>
        
        <Button
          onClick={handleOpenStoreMap}
          disabled={isLoading}
          className="w-full flex items-center gap-2"
          variant="secondary"
        >
          <MapPin className="w-4 h-4" />
          {isLoading ? '開啟中...' : '選擇取貨門市'}
        </Button>
      </div>
      
      {/* 使用說明 */}
      <div className="text-xs space-y-1" style={{ color: "var(--text-tertiary)" }}>
        <div>• 點擊「選擇取貨門市」會開啟綠界官方電子地圖</div>
        <div>• 在地圖上可選擇 7-11、全家、萊爾富等門市</div>
        <div>• 選擇完成後關閉視窗即可繼續結帳流程</div>
      </div>
    </div>
  )
}

export default EcpayStoreMap
