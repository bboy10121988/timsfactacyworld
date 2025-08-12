"use client"

import { RadioGroup } from "@headlessui/react"
import { isStripe as isStripeFunc, paymentInfoMap } from "@lib/constants"
import { initiatePaymentSession } from "@lib/data/cart"
import { CheckCircleSolid, CreditCard } from "@medusajs/icons"
import { Button, Container, Heading, Text, clx } from "@medusajs/ui"
import { sdk } from "@lib/config"
import ErrorMessage from "@modules/checkout/components/error-message"
import PaymentContainer, { StripeCardContainer } from "@modules/checkout/components/payment-container"
import Divider from "@modules/common/components/divider"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

// 檢查是否為綠界支付方式
const isEcpay = (providerId: string | undefined) => {
  return providerId?.includes("ecpay_")
}

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: any
  availablePaymentMethods: any[]
}) => {
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession: any) => paymentSession.status === "pending"
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardBrand, setCardBrand] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? ""
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "payment"

  const isStripe = isStripeFunc(selectedPaymentMethod)
  const isEcpayMethod = isEcpay(selectedPaymentMethod)

  const setPaymentMethod = async (method: string) => {

    console.log("選擇的支付方式:", method)

    setError(null)

    setSelectedPaymentMethod(method)

    switch (method){
      case "ecpay":
        await initiatePaymentSession(cart, {
          provider_id: "pp_my-payment-service_my-payment-service",
          // provider_id:"pp_my-payment-service_ecpay_credit_card"
        })
        break
        // 這裡走綠界支付流程
      case "default":
        await initiatePaymentSession(cart, {
          provider_id: "pp_system_default",
        })
        break
        // 這裡走銀行轉帳流程
      default:
        setError("不支援的支付方式")
        return
    }


    if (isStripeFunc(method)) {
      await initiatePaymentSession(cart, {
        provider_id: method,
      })
    } else if (isEcpay(method)) {
      await initiatePaymentSession(cart, {
        provider_id: method,
      })
    }
  }

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const paymentReady =
    (activeSession && cart?.shipping_methods.length !== 0) || paidByGiftcard

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    })
  }

  const handleSubmit = async () => {
    //my-medusa-store
  
    setIsLoading(true)


    try {

      console.log("provider id ",selectedPaymentMethod)

      const shouldInputCard =isStripeFunc(selectedPaymentMethod) && !activeSession

      const checkActiveSession =
        activeSession?.provider_id === selectedPaymentMethod

      if (!checkActiveSession) {
        
        // 取得實際的支付方式
        const currentPayment = selectedPaymentMethod
        console.log("當前選擇的支付方式:", currentPayment)
        
        // 如果是綠界支付，使用選擇的支付方式；否則使用系統預設
        // const providerToUse = isEcpayMethod ? currentPayment : "pp_system_default"
        const providerToUse = isEcpayMethod ? "pp_my-payment-service_my-payment-service" : "pp_system_default"
        console.log("使用的支付方式:", providerToUse)
        
        await initiatePaymentSession(cart, {
          provider_id: providerToUse,
        })
      }

      // 處理綠界支付方式
      if (selectedPaymentMethod === "ecpay") {
        console.log("綠界支付方式被選中", selectedPaymentMethod)

        try {
          // 1. 確保有有效的付款會話
          const currentActiveSession = cart.payment_collection?.payment_sessions?.find(
            (session: any) => session.provider_id === "pp_my-payment-service_my-payment-service" && session.status === "pending"
          )

          console.log("here1")

          if (!currentActiveSession) {
            console.log("沒有找到有效的 ECPay 付款會話，正在建立...")
            await initiatePaymentSession(cart, {
              provider_id: "pp_my-payment-service_my-payment-service",
            })

            
            // 重新獲取購物車以取得最新的付款會話
            const updatedCart = await sdk.store.cart.retrieve(cart.id)
            const newSession = (updatedCart as any).payment_collection?.payment_sessions?.find(
              (session: any) => session.provider_id === "pp_my-payment-service_my-payment-service"
            )

            
            if (!newSession) {
              throw new Error('無法建立 ECPay 付款會話')
            }
            console.log("ECPay 付款會話建立成功:", newSession.id)
          }

          // 2. 建立 ECPay 付款表單
          console.log("正在建立 ECPay 付款表單...")
          const ecpayResponse = await fetch('/api/ecpay/payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              cart: cart,
              customer: cart.customer,
              shippingAddress: cart.shipping_address,
              shippingMethod: cart.shipping_methods?.[0],
              selectedStore: null, // 暫時不使用門市
            }),
          })

          console.log("ECPay 付款表單建立請求已發送")

          if (!ecpayResponse.ok) {
            const errorText = await ecpayResponse.text()
            throw new Error(`ECPay 付款建立失敗: ${ecpayResponse.status} - ${errorText}`)
          }

          const ecpayData = await ecpayResponse.json()
          console.log("ECPay 回應:", ecpayData)

          // 3. 處理 ECPay 表單並提交
          if (ecpayData.html) {
            console.log("收到 ECPay HTML 表單，準備提交...")
            
            // 建立隱藏的 div 容器
            const formContainer = document.createElement('div')
            formContainer.style.display = 'none'
            formContainer.innerHTML = ecpayData.html
            
            // 將容器加到頁面
            document.body.appendChild(formContainer)
            
            // 找到表單並提交
            const ecpayForm = formContainer.querySelector('form')
            if (ecpayForm) {
              console.log("找到 ECPay 表單，正在提交...")
              console.log("表單 action:", ecpayForm.action)
              console.log("表單 method:", ecpayForm.method)
              console.log("表單 ID:", ecpayForm.id)
              
              // 移除 script 標籤避免自動執行
              const scripts = formContainer.querySelectorAll('script')
              scripts.forEach(script => script.remove())
              
              // 手動提交表單跳轉到綠界
              ecpayForm.submit()
              return // 提交表單後結束函數執行
            } else {
              throw new Error('ECPay 回應中的 HTML 沒有包含有效的表單')
            }
          } else if (ecpayData.paymentUrl) {
            console.log("收到 ECPay 付款 URL，跳轉到:", ecpayData.paymentUrl)
            window.location.href = ecpayData.paymentUrl
            return // 跳轉後結束函數執行
          } else {
            console.error("ECPay 回應格式錯誤:", ecpayData)
            throw new Error('ECPay 回應中沒有找到有效的表單或付款 URL')
          }

        } catch (error) {
          console.error('ECPay 付款初始化失敗:', error)
          setError(`ECPay 付款初始化失敗: ${error instanceof Error ? error.message : '未知錯誤'}`)
          return // 發生錯誤時結束函數執行
        }
      }

      // 處理 Stripe 等其他支付方式
      if (!shouldInputCard) {
        console.log("非 Stripe 支付方式，跳轉到檢視訂單")

        return router.push(
          pathname + "?" + createQueryString("step", "review"),
          {
            scroll: false,
          }
        )
      }
    } catch (err: any) {

      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-2xl gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none":
                !isOpen && !paymentReady,
            }
          )}
        >
          付款方式
          {!isOpen && paymentReady && <CheckCircleSolid />}
        </Heading>
        {!isOpen && paymentReady && (
          <Text>
            <button
              onClick={handleEdit}
              className="text-blue-600 hover:text-blue-600-hover"
              data-testid="edit-payment-button"
            >
              編輯
            </button>
          </Text>
        )}
      </div>
      <div>
        <div className={isOpen ? "block" : "hidden"}>
          {!paidByGiftcard && (
            <>
              {/* 只顯示兩個硬編碼選項：綠界支付（含刷卡）與銀行轉帳 */}
              <RadioGroup value={selectedPaymentMethod} onChange={setPaymentMethod}>
                <RadioGroup.Option value="ecpay">
                  {({ checked }) => (
                    <div className={`border p-4 rounded mb-2 ${checked ? 'border-blue-500' : 'border-gray-200'}`}>
                      <Heading level="h3" className="text-base font-medium mb-1">綠界支付（含刷卡）</Heading>
                      <Text className="text-sm text-gray-600">信用卡 / 金融卡 (VISA、Mastercard、JCB)</Text>
                    </div>
                  )}
                </RadioGroup.Option>
                <RadioGroup.Option value="default">
                  {({ checked }) => (
                    <div className={`border p-4 rounded mb-2 ${checked ? 'border-blue-500' : 'border-gray-200'}`}>
                      <Heading level="h3" className="text-base font-medium mb-1">銀行轉帳</Heading>
                      <Text className="text-sm text-gray-600">手動銀行轉帳 (需要人工核帳)</Text>
                    </div>
                  )}
                </RadioGroup.Option>
              </RadioGroup>
            </>
          )}

          {paidByGiftcard && (
            <div className="flex flex-col w-1/3">
              <Text className="text-sm text-gray-900 mb-1 font-medium">
                付款方式
              </Text>
              <Text
                className="text-xs text-gray-600"
                data-testid="payment-method-summary"
              >
                禮品卡
              </Text>
            </div>
          )}

          <ErrorMessage
            error={error}
            data-testid="payment-method-error-message"
          />

          <Button
            size="large"
            className="mt-6"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={
              (isStripe && !cardComplete) ||
              (!selectedPaymentMethod && !paidByGiftcard)
            }
            data-testid="submit-payment-button"
          >
            {!activeSession && isStripeFunc(selectedPaymentMethod)
              ? "輸入信用卡資料"
              : selectedPaymentMethod === "ecpay"
                ? "前往綠界付款"
                : selectedPaymentMethod === "default"
                  ? "確認銀行轉帳"
                  : "繼續檢視訂單"}
          </Button>
        </div>

        <div className={isOpen ? "hidden" : "block"}>
          {cart && paymentReady && activeSession ? (
            <div className="flex items-start gap-x-1 w-full">
              <div className="flex flex-col w-1/3">
                <Text className="text-sm text-gray-900 mb-1 font-medium">
                  付款方式
                </Text>
                <Text
                  className="text-xs text-gray-600"
                  data-testid="payment-method-summary"
                >
                  {paymentInfoMap[activeSession?.provider_id]?.title ||
                    activeSession?.provider_id}
                </Text>
              </div>
              <div className="flex flex-col w-1/3">
                <Text className="text-sm text-gray-900 mb-1 font-medium">
                  付款詳情
                </Text>
                <div
                  className="flex gap-2 text-xs text-gray-600 items-center"
                  data-testid="payment-details-summary"
                >
                  <Container className="flex items-center h-7 w-fit p-2 bg-gray-200">
                    {paymentInfoMap[selectedPaymentMethod]?.icon || (
                      <CreditCard />
                    )}
                  </Container>
                  <Text>
                    {isStripeFunc(selectedPaymentMethod) && cardBrand
                      ? cardBrand
                      : "將於下一步顯示"}
                  </Text>
                </div>
              </div>
            </div>
          ) : paidByGiftcard ? (
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-gray-900 mb-1">
                付款方式
              </Text>
              <Text
                className="txt-medium text-gray-600"
                data-testid="payment-method-summary"
              >
                禮品卡
              </Text>
            </div>
          ) : null}
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default Payment
