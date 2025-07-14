"use client"

import { useEffect, useState } from "react"
import { HttpTypes } from "@medusajs/types"

type LiveInventoryProps = {
  variant?: HttpTypes.StoreProductVariant
  className?: string
}

/**
 * 實時庫存顯示組件
 * 從 Medusa 後端獲取最新的庫存數據並顯示
 */
const LiveInventory = ({ variant, className = "" }: LiveInventoryProps) => {
  const [inventory, setInventory] = useState({
    isLoading: false,
    inventory_quantity: variant?.inventory_quantity,
    error: null as string | null,
    lastUpdated: null as string | null,
    retryCount: 0,
  })

  // 重試函數
  const fetchWithRetry = async (url: string, retries = 3, delay = 300) => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`無法獲取庫存: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      if (retries <= 0) throw error
      await new Promise(resolve => setTimeout(resolve, delay))
      return fetchWithRetry(url, retries - 1, delay * 1.5)
    }
  }

  useEffect(() => {
    // 當變體改變時，重置庫存數據
    setInventory({
      isLoading: false,
      inventory_quantity: variant?.inventory_quantity,
      error: null,
      lastUpdated: null,
      retryCount: 0,
    })

    // 如果沒有變體或變體ID，不執行任何操作
    if (!variant?.id) return

    // 獲取最新庫存
    const fetchInventory = async () => {
      setInventory(prev => ({ ...prev, isLoading: true, retryCount: 0 }))
      try {
        // 使用相對路徑而不是依賴環境變數，並使用重試機制
        const data = await fetchWithRetry(`/api/variants/${variant.id}`)
        
        setInventory({
          isLoading: false,
          inventory_quantity: data.variant.inventory_quantity,
          error: null,
          lastUpdated: data._meta?.timestamp || new Date().toISOString(),
          retryCount: 0,
        })
      } catch (err) {
        console.error("獲取庫存錯誤:", err)
        setInventory(prev => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "獲取庫存時出錯",
          retryCount: prev.retryCount + 1,
        }))
        
        // 如果錯誤且重試次數少於3次，延遲1秒後重試
        if (inventory.retryCount < 3) {
          setTimeout(() => {
            fetchInventory()
          }, 1000)
        }
      }
    }

    fetchInventory()
  }, [variant])

  if (!variant) return null

  // 不管理庫存的變體
  if (variant.manage_inventory === false) {
    return (
      <div className={`text-sm ${className}`}>
        <span className="text-gray-600">庫存狀態: </span>
        <span className="text-green-600">有庫存</span>
      </div>
    )
  }

  // 允許缺貨訂購的變體
  if (variant.allow_backorder) {
    const hasStock = typeof inventory.inventory_quantity === 'number' && inventory.inventory_quantity > 0
    
    return (
      <div className={`text-sm ${className}`}>
        <span className="text-gray-600">庫存狀態: </span>
        {hasStock ? (
          <span className="text-green-600">有庫存 ({inventory.inventory_quantity})</span>
        ) : (
          <span className="text-orange-500">可預訂</span>
        )}
        <div className="text-xs text-gray-500 mt-1">
          {hasStock ? "可立即出貨" : "目前無庫存，但可接受預訂"}
        </div>
      </div>
    )
  }

  // 一般庫存管理的變體
  const hasStock = typeof inventory.inventory_quantity === 'number' && inventory.inventory_quantity > 0
  
  if (inventory.isLoading) {
    return (
      <div className={`text-sm ${className}`}>
        <span className="text-gray-600">庫存狀態: </span>
        <span className="text-gray-500">
          <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2 align-[-2px]"></span>
          正在檢查...
        </span>
      </div>
    )
  }

  if (inventory.error) {
    return (
      <div className={`text-sm ${className}`}>
        <span className="text-gray-600">庫存狀態: </span>
        <span className="text-gray-500">無法確認</span>
        <button 
          onClick={() => setInventory(prev => ({ ...prev, isLoading: true, retryCount: 0 }))}
          className="text-xs ml-2 text-blue-600 underline"
        >
          重試
        </button>
        <div className="text-xs text-gray-500 mt-1">使用最後已知庫存資訊</div>
      </div>
    )
  }

  return (
    <div className={`text-sm ${className}`}>
      <span className="text-gray-600">庫存狀態: </span>
      {hasStock ? (
        <>
          <span className="text-green-600">有庫存</span>
          {inventory.lastUpdated && (
            <span className="text-xs text-gray-400 ml-2">
              {new Date(inventory.lastUpdated).toLocaleTimeString('zh-TW', {hour: '2-digit', minute:'2-digit'})} 更新
            </span>
          )}
          <div className="text-xs text-gray-500 mt-1">
            {inventory.inventory_quantity && inventory.inventory_quantity <= 5 ? (
              <span className="text-orange-500">僅剩 {inventory.inventory_quantity} 件，售完為止！</span>
            ) : (
              "可立即出貨"
            )}
          </div>
        </>
      ) : (
        <>
          <span className="text-red-500">缺貨</span>
          <div className="text-xs text-gray-500 mt-1">目前無庫存，請選擇其他款式</div>
        </>
      )}
    </div>
  )
}

export default LiveInventory
