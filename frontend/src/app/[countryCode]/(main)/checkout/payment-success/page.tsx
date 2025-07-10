import { Heading, Text } from "@medusajs/ui"
import { CheckCircleSolid } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function EcpaySuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md">
        <CheckCircleSolid className="w-16 h-16 text-green-500 mx-auto mb-6" />
        
        <Heading level="h1" className="text-2xl font-semibold mb-4 text-gray-900">
          付款成功！
        </Heading>
        
        <Text className="text-gray-600 mb-6 leading-relaxed">
          感謝您的購買！您的訂單已確認，我們將盡快為您處理。
          訂單詳情已發送到您的信箱。
        </Text>

        <div className="space-y-3">
          <LocalizedClientLink
            href="/account/orders"
            className="inline-block w-full bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors duration-200"
          >
            查看我的訂單
          </LocalizedClientLink>
          
          <LocalizedClientLink
            href="/store"
            className="inline-block w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:border-gray-400 transition-colors duration-200"
          >
            繼續購物
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
