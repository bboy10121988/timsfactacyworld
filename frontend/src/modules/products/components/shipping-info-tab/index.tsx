import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"
import { HttpTypes } from "@medusajs/types"
import { Package, Clock, AlertCircle } from "lucide-react"

type ShippingInfoTabProps = {
  product?: HttpTypes.StoreProduct
}

const ShippingInfoTab = ({ product }: ShippingInfoTabProps) => {
  // 檢查是否有允許預訂的變體
  const hasBackorderVariants = product?.variants?.some(v => v.allow_backorder)
  
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-y-8">
        <div className="flex items-start gap-x-2">
          <FastDelivery />
          <div>
            <span className="font-semibold">快速配送</span>
            <p className="max-w-sm text-sm text-gray-600">
              週一至週五 14:00 前下單，隔日送達 (假日順延)。全台灣本島地區免運費，離島地區需額外運費。
            </p>
          </div>
        </div>
        
        {/* 庫存資訊 - 新增 */}
        <div className="flex items-start gap-x-2">
          <Package className="w-5 h-5" />
          <div>
            <span className="font-semibold">庫存政策</span>
            <p className="max-w-sm text-sm text-gray-600">
              我們的庫存數量實時更新。商品頁面上標示的庫存數量為目前可購買的確切數量。
            </p>
          </div>
        </div>
        
        {/* 預訂資訊 - 如果有預訂選項才顯示 */}
        {hasBackorderVariants && (
          <div className="flex items-start gap-x-2">
            <Clock className="w-5 h-5" />
            <div>
              <span className="font-semibold">預訂商品說明</span>
              <p className="max-w-sm text-sm text-gray-600">
                標示為「可預訂」的商品目前無庫存，但您可以提前預訂。預訂商品將在到貨後按訂單順序出貨，
                預計到貨時間請洽客服。預訂商品無法與現貨商品合併出貨。
              </p>
            </div>
          </div>
        )}
        
        <div className="flex items-start gap-x-2">
          <Refresh />
          <div>
            <span className="font-semibold">簡單換貨</span>
            <p className="max-w-sm text-sm text-gray-600">
              尺寸不合適？收到商品後7天內可申請換貨，商品需保持全新狀態且包裝完整。
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-x-2">
          <Back />
          <div>
            <span className="font-semibold">輕鬆退貨</span>
            <p className="max-w-sm text-sm text-gray-600">
              收到商品後7天內可申請退貨。只需退回您的產品，我們將退還您的款項。
              客製化商品、特價商品不適用退換貨政策。
            </p>
          </div>
        </div>
        
        {/* 特殊注意事項 - 新增 */}
        <div className="flex items-start gap-x-2">
          <AlertCircle className="w-5 h-5" />
          <div>
            <span className="font-semibold">特殊注意事項</span>
            <p className="max-w-sm text-sm text-gray-600">
              因拍攝光線和顯示器設定不同，實際商品顏色可能與圖片略有差異。尺寸資訊供參考，實際尺寸可能有±1-2cm誤差。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShippingInfoTab
