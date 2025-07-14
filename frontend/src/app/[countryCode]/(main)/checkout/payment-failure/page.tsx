import { Heading, Text } from "@medusajs/ui"
import { XCircleSolid } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function EcpayFailurePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md">
        <XCircleSolid className="w-16 h-16 text-red-500 mx-auto mb-6" />
        
        <Heading level="h1" className="text-2xl font-semibold mb-4 text-gray-900">
          付款失敗
        </Heading>
        
        <Text className="text-gray-600 mb-6 leading-relaxed">
          很抱歉，您的付款未能成功處理。請檢查您的付款資訊或嘗試其他付款方式。
        </Text>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <Text className="text-sm text-red-800">
            <strong>可能原因：</strong><br />
            • 信用卡餘額不足<br />
            • 信用卡資訊錯誤<br />
            • 銀行系統暫時無法處理<br />
            • 交易被銀行拒絕
          </Text>
        </div>

        <div className="space-y-3">
          <LocalizedClientLink
            href="/checkout"
            className="inline-block w-full bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors duration-200"
          >
            重新嘗試付款
          </LocalizedClientLink>
          
          <LocalizedClientLink
            href="/cart"
            className="inline-block w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:border-gray-400 transition-colors duration-200"
          >
            回到購物車
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
