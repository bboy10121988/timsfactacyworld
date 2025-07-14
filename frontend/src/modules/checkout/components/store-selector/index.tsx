"use client"

import { useState } from "react"
import { Button, Heading, Text } from "@medusajs/ui"
import { MapPin } from "@medusajs/icons"

type ConvenienceStore = {
  id: string
  name: string
  address: string
  distance: number
  type: '7-11' | '全家' | 'OK' | '萊爾富'
}

type StoreSelectorProps = {
  onStoreSelect: (store: ConvenienceStore) => void
  selectedStore?: ConvenienceStore | null
}

const StoreSelector: React.FC<StoreSelectorProps> = ({ 
  onStoreSelect, 
  selectedStore 
}) => {
  const [showStoreList, setShowStoreList] = useState(false)
  const [searchAddress, setSearchAddress] = useState("")

  // 模擬門市資料 - 實際會從綠界 API 取得
  const mockStores: ConvenienceStore[] = [
    {
      id: "001",
      name: "統一超商-台北車站店",
      address: "台北市中正區北平西路3號1樓",
      distance: 0.3,
      type: "7-11"
    },
    {
      id: "002", 
      name: "全家便利商店-台北站前店",
      address: "台北市中正區忠孝西路一段50號1樓",
      distance: 0.5,
      type: "全家"
    },
    {
      id: "003",
      name: "統一超商-館前店",
      address: "台北市中正區館前路8號1樓",
      distance: 0.7,
      type: "7-11"
    }
  ]

  const getStoreIcon = (type: string) => {
    const iconClass = "w-6 h-6"
    switch (type) {
      case "7-11":
        return <div className={`${iconClass} bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold`}>7</div>
      case "全家":
        return <div className={`${iconClass} bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold`}>全</div>
      default:
        return <div className={`${iconClass} bg-gray-500 rounded flex items-center justify-center text-white text-xs font-bold`}>店</div>
    }
  }

  return (
    <div className="space-y-4">
      {/* 已選擇的門市 */}
      {selectedStore && (
        <div className="p-4 border border-gray-200 rounded-lg bg-green-50">
          <div className="flex items-start gap-3">
            {getStoreIcon(selectedStore.type)}
            <div className="flex-1">
              <Text className="font-medium text-green-800">{selectedStore.name}</Text>
              <Text className="text-sm text-green-600 mt-1">{selectedStore.address}</Text>
              <Text className="text-xs text-green-500 mt-1">距離約 {selectedStore.distance} 公里</Text>
            </div>
            <Button
              variant="secondary"
              size="small"
              onClick={() => setShowStoreList(true)}
            >
              更換門市
            </Button>
          </div>
        </div>
      )}

      {/* 選擇門市按鈕 */}
      {!selectedStore && (
        <Button
          variant="secondary"
          onClick={() => setShowStoreList(true)}
          className="w-full flex items-center gap-2"
        >
          <MapPin className="w-4 h-4" />
          選擇取貨門市
        </Button>
      )}

      {/* 門市選擇彈窗 */}
      {showStoreList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <Heading level="h3">選擇取貨門市</Heading>
                <Button
                  variant="transparent"
                  onClick={() => setShowStoreList(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>
              
              {/* 地址搜尋 */}
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="請輸入地址搜尋附近門市..."
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
                <Button className="w-full mt-2" size="small">
                  搜尋附近門市
                </Button>
              </div>
            </div>

            {/* 門市列表 */}
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {mockStores.map((store) => (
                <div
                  key={store.id}
                  className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors"
                  onClick={() => {
                    onStoreSelect(store)
                    setShowStoreList(false)
                  }}
                >
                  <div className="flex items-start gap-3">
                    {getStoreIcon(store.type)}
                    <div className="flex-1">
                      <Text className="font-medium">{store.name}</Text>
                      <Text className="text-sm text-gray-600 mt-1">{store.address}</Text>
                      <Text className="text-xs text-gray-500 mt-1">距離約 {store.distance} 公里</Text>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StoreSelector
