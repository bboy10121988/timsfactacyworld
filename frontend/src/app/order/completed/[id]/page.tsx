import { Metadata } from "next"
import OrderCompletedTemplate from "@modules/order/templates/order-completed-template"
import { retrieveOrder } from "@lib/data/orders"
import { notFound } from "next/navigation"

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export const metadata: Metadata = {
  title: "訂單完成",
  description: "您的訂單已成功處理完成",
}

export default async function OrderCompletedPage({ params }: Props) {
  const { id } = await params
  
  if (!id) {
    console.log('❌ 訂單 ID 缺失')
    notFound()
  }

  try {
    console.log(`🔍 查詢訂單: ${id}`)
    const order = await retrieveOrder(id)
    
    if (!order) {
      console.log(`❌ 訂單不存在: ${id}`)
      notFound()
    }

    console.log(`✅ 訂單查詢成功: ${order.id}`)

    return <OrderCompletedTemplate order={order} />
  } catch (error) {
    console.error('💥 查詢訂單時發生錯誤:', error)
    notFound()
  }
}
