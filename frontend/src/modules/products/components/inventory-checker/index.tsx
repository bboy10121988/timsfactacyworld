"use client"

import { useEffect, useState } from "react"

/**
 * 檢查庫存組件
 * 用於在客戶端獲取商品變體的庫存狀態
 */
export default function InventoryChecker({
  variantId,
  render,
}: {
  variantId: string
  render: (data: {
    isLoading: boolean
    error?: string
    available_quantity?: number
    stocked_quantity?: number
    reserved_quantity?: number
    isInStock: boolean
  }) => React.ReactNode
}) {
  const [state, setState] = useState({
    isLoading: true,
    isInStock: false,
    available_quantity: 0,
    stocked_quantity: 0,
    reserved_quantity: 0,
  })

  useEffect(() => {
    if (!variantId) {
      setState({
        isLoading: false,
        isInStock: false,
        available_quantity: 0,
        stocked_quantity: 0,
        reserved_quantity: 0,
      })
      return
    }

    setState(prev => ({ ...prev, isLoading: true }))

    // 嘗試使用庫存API - 假設可能會失敗，因為不是所有安裝都設置了庫存模組
    fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/variants/${variantId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`獲取庫存失敗: ${response.statusText}`)
        }
        return response.json()
      })
      .then(data => {
        const variantData = data.variant
        
        setState({
          isLoading: false,
          available_quantity: variantData.inventory_quantity || 0,
          stocked_quantity: variantData.inventory_quantity || 0,
          reserved_quantity: 0,
          isInStock: variantData.inventory_quantity > 0 || variantData.allow_backorder
        })
      })
      .catch(err => {
        console.error('庫存查詢錯誤:', err)
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : '庫存查詢失敗',
          isInStock: false
        }))
      })
  }, [variantId])

  return <>{render(state)}</>
}
