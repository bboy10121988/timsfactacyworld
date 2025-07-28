"use client"

import { isManual, isStripe, isECPay } from "@lib/constants"
import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import React, { useState } from "react"
import ErrorMessage from "../error-message"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
  selectedPaymentMethod?: string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
  selectedPaymentMethod,
}) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  // 優先使用傳入的 selectedPaymentMethod，否則使用 payment session，最後從localStorage獲取
  let paymentMethod = selectedPaymentMethod || paymentSession?.provider_id
  
  // 如果沒有payment method，嘗試從localStorage獲取
  if (!paymentMethod && typeof window !== 'undefined') {
    paymentMethod = localStorage.getItem('selectedPaymentMethod') || undefined
  }

  switch (true) {
    case isStripe(paymentMethod):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isECPay(paymentMethod):
      return (
        <ECPayPaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
          selectedPaymentMethod={paymentMethod}
        />
      )
    case isManual(paymentMethod):
      return (
        <ManualTestPaymentButton notReady={notReady} data-testid={dataTestId} />
      )
    default:
      return <Button disabled>請選擇付款方式</Button>
  }
}

const StripePaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const stripe = useStripe()
  const elements = useElements()
  const card = elements?.getElement("card")

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const disabled = !stripe || !elements ? true : false

  const handlePayment = async () => {
    setSubmitting(true)

    if (!stripe || !elements || !card || !cart) {
      setSubmitting(false)
      return
    }

    await stripe
      .confirmCardPayment(session?.data.client_secret as string, {
        payment_method: {
          card: card,
          billing_details: {
            name:
              cart.billing_address?.first_name +
              " " +
              cart.billing_address?.last_name,
            address: {
              city: cart.billing_address?.city ?? undefined,
              country: cart.billing_address?.country_code ?? undefined,
              line1: cart.billing_address?.address_1 ?? undefined,
              line2: cart.billing_address?.address_2 ?? undefined,
              postal_code: cart.billing_address?.postal_code ?? undefined,
              state: cart.billing_address?.province ?? undefined,
            },
            email: cart.email,
            phone: cart.billing_address?.phone ?? undefined,
          },
        },
      })
      .then(({ error, paymentIntent }) => {
        if (error) {
          const pi = error.payment_intent

          if (
            (pi && pi.status === "requires_capture") ||
            (pi && pi.status === "succeeded")
          ) {
            onPaymentCompleted()
          }

          setErrorMessage(error.message || null)
          return
        }

        if (
          (paymentIntent && paymentIntent.status === "requires_capture") ||
          paymentIntent.status === "succeeded"
        ) {
          return onPaymentCompleted()
        }

        return
      })
  }

  return (
    <>
      <Button
        disabled={disabled || notReady}
        onClick={handlePayment}
        size="large"
        isLoading={submitting}
        data-testid={dataTestId}
      >
        送出訂單
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  )
}

const ECPayPaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
  selectedPaymentMethod,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
  selectedPaymentMethod?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const paymentSession = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const handlePayment = async () => {
    setSubmitting(true)
    setErrorMessage(null)

    if (!cart || !paymentSession) {
      setSubmitting(false)
      setErrorMessage("付款資訊不完整")
      return
    }

    try {
      // 使用新的 Medusa payment provider 流程
      const redirectUrl = paymentSession.data?.redirect_url
      
      if (!redirectUrl || typeof redirectUrl !== 'string') {
        throw new Error("無法取得付款跳轉 URL")
      }

      // 準備購物車資料
      const cartData = {
        cart: {
          id: cart.id,
          total: cart.total || 0,
          items: cart.items?.map(item => ({
            title: item.title || item.variant?.title || item.variant?.product?.title || "商品",
            quantity: item.quantity,
          })) || []
        },
        customer: {
          email: cart.email,
          first_name: cart.billing_address?.first_name || cart.shipping_address?.first_name,
          last_name: cart.billing_address?.last_name || cart.shipping_address?.last_name,
        },
        shippingAddress: cart.shipping_address,
        choosePayment: "ALL" // ECPay 支持所有支付方式
      }

      // 調用 ECPay 創建付款端點
      const response = await fetch(redirectUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
        },
        body: JSON.stringify(cartData),
      })

      if (!response.ok) {
        throw new Error("建立付款失敗")
      }

      const data = await response.json()

      if (data.html) {
        // 創建一個容器來放置 ECPay 表單
        const tempDiv = document.createElement("div")
        tempDiv.innerHTML = data.html
        
        // 找到表單並提交
        const form = tempDiv.querySelector("form")
        
        if (form) {
          // 將表單添加到頁面並自動提交（會跳轉到 ECPay）
          document.body.appendChild(form)
          form.submit()
          
          // 清理
          document.body.removeChild(form)
        } else {
          throw new Error("無效的 ECPay 付款表單")
        }
      } else {
        throw new Error(data.error || "ECPay 付款建立失敗")
      }
      
    } catch (error: any) {
      console.error("ECPay payment error:", error)
      setErrorMessage(error.message || "付款處理失敗")
      setSubmitting(false)
    }
  }

  return (
    <>
      <Button
        disabled={notReady}
        onClick={handlePayment}
        size="large"
        isLoading={submitting}
        data-testid={dataTestId}
      >
        繼續到綠界付款
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="ecpay-payment-error-message"
      />
    </>
  )
}

const ManualTestPaymentButton = ({ notReady }: { notReady: boolean }) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const handlePayment = () => {
    setSubmitting(true)

    onPaymentCompleted()
  }

  return (
    <>
      <Button
        disabled={notReady}
        isLoading={submitting}
        onClick={handlePayment}
        size="large"
        data-testid="submit-order-button"
      >
        送出訂單
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />
    </>
  )
}

export default PaymentButton
