"use client"

import { useState } from "react"
import { Button } from "@medusajs/ui"
import { toast } from "react-hot-toast"

type Props = {
  orderId: string
}

export default function EcpayCheckout({ orderId }: Props) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePayment = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/ecpay/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_id: orderId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '建立付款資訊時發生錯誤')
      }

      const data = await response.json()
      
      if (!data.html) {
        throw new Error('未收到付款表單 HTML')
      }

      // 創建一個臨時的 form 來提交到綠界
      const form = document.createElement('form')
      form.innerHTML = data.html
      document.body.appendChild(form)
      form.submit()
    } catch (error) {
      console.error('付款處理錯誤:', error)
      toast.error(error instanceof Error ? error.message : '建立付款資訊時發生錯誤')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="primary"
      onClick={handlePayment}
      isLoading={isLoading}
      className="w-full"
    >
      使用綠界支付
    </Button>
  )
}
