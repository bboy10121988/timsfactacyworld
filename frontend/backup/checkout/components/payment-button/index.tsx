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
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
}) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  switch (true) {
    case isStripe(paymentSession?.provider_id):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isECPay(paymentSession?.provider_id):
      return (
        <ECPayPaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isManual(paymentSession?.provider_id):
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
      // 建立ECPay付款
      const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/ecpay/create-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cart: {
            id: cart.id,
            items: cart.items,
            total: cart.total,
            subtotal: cart.subtotal,
            tax_total: cart.tax_total,
            shipping_total: cart.shipping_total,
            region: cart.region,
            email: cart.email,
            shipping_address: cart.shipping_address,
            billing_address: cart.billing_address,
            shipping_methods: cart.shipping_methods
          },
          customer: cart.customer_id ? { id: cart.customer_id } : null,
          shippingAddress: cart.shipping_address,
          shippingMethod: cart.shipping_methods?.[0],
          choosePayment: paymentSession.provider_id,
        }),
      })

      if (!response.ok) {
        throw new Error("建立付款失敗")
      }

      const data = await response.json()

      if (data.form_html) {
        // 開新視窗到ECPay付款頁面
        const tempDiv = document.createElement("div")
        tempDiv.innerHTML = data.form_html
        const form = tempDiv.querySelector("form")
        
        if (form) {
          // 修改form target為新視窗
          form.setAttribute('target', '_blank')
          
          // 開啟ECPay付款視窗
          const paymentWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes')
          
          if (!paymentWindow) {
            throw new Error("無法開啟付款視窗，請檢查瀏覽器彈出視窗設定")
          }
          
          // 在新視窗中提交表單
          document.body.appendChild(form)
          form.submit()
          
          // 監聽視窗關閉事件
          const checkClosed = setInterval(() => {
            if (paymentWindow.closed) {
              clearInterval(checkClosed)
              // 視窗關閉後，檢查付款結果並重新導向
              setTimeout(() => {
                window.location.href = `/order/payment-result?cart_id=${cart.id}`
              }, 1000)
            }
          }, 1000)
          
          setSubmitting(false)
          return
        }
      }

      // 如果沒有表單或其他付款方式，直接完成訂單
      await onPaymentCompleted()
      
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
        {submitting ? "處理中..." : "確認付款"}
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
