import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"

const ShippingInfoTab = () => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-y-8">
        <div className="flex items-start gap-x-2">
          <FastDelivery />
          <div>
            <span className="font-semibold">快速配送</span>
            <p className="max-w-sm text-sm text-gray-600">
              您的包裹將在 3-5 個工作日內送達您的取貨地點或您的家中。
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Refresh />
          <div>
            <span className="font-semibold">簡單換貨</span>
            <p className="max-w-sm text-sm text-gray-600">
              尺寸不合適？別擔心 - 我們會為您更換新的商品。
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Back />
          <div>
            <span className="font-semibold">輕鬆退貨</span>
            <p className="max-w-sm text-sm text-gray-600">
              只需退回您的產品，我們將退還您的款項。無需問題 - 我們將盡最大努力確保您的退貨過程順利無憂。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShippingInfoTab
