'use client'

import { Button } from "@medusajs/ui"
import { useState } from "react"
import { useCart } from "medusa-react"
import { toast } from "react-hot-toast"

const EcpayPaymentButton = ({ orderId }: { orderId: string }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { cart } = useCart()

  const handlePayment = async () => {
    // 檢查訂單 ID
    if (!orderId) {
      toast.error("訂單資訊不存在")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/ecpay/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          order_id: orderId,
          shipping_address: cart.shipping_address 
        }),
      })

      const { html } = await response.json()

      // 創建一個臨時的 form 來提交到綠界
      const form = document.createElement("form")
      form.innerHTML = html
      document.body.appendChild(form)
      form.submit()
    } catch (error) {
      console.error("Payment creation failed:", error)
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
