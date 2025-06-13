import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const DetailedSpecsTab = ({ product }: ProductTabsProps) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-y-6">
        {product.subtitle && (
          <div>
            <span className="font-semibold text-xs uppercase tracking-wide">副標題</span>
            <p className="mt-2 text-sm">{product.subtitle}</p>
          </div>
        )}
        <div>
          <span className="font-semibold text-xs uppercase tracking-wide">商品編號</span>
          <p className="mt-2 text-sm">{product.id}</p>
        </div>
        <div>
          <span className="font-semibold text-xs uppercase tracking-wide">URL 句柄</span>
          <p className="mt-2 text-sm">{product.handle}</p>
        </div>
        <div>
          <span className="font-semibold text-xs uppercase tracking-wide">是否為禮品卡</span>
          <p className="mt-2 text-sm">{product.is_giftcard ? '是' : '否'}</p>
        </div>
        <div>
          <span className="font-semibold text-xs uppercase tracking-wide">可折扣</span>
          <p className="mt-2 text-sm">{product.discountable ? '是' : '否'}</p>
        </div>
        <div>
          <span className="font-semibold text-xs uppercase tracking-wide">HSCode</span>
          <p className="mt-2 text-sm">{product.hs_code || '-'}</p>
        </div>
        <div>
          <span className="font-semibold text-xs uppercase tracking-wide">MID Code</span>
          <p className="mt-2 text-sm">{product.mid_code || '-'}</p>
        </div>
        <div>
          <span className="font-semibold text-xs uppercase tracking-wide">創建時間</span>
          <p className="mt-2 text-sm">{formatDate(product.created_at)}</p>
        </div>
        <div>
          <span className="font-semibold text-xs uppercase tracking-wide">更新時間</span>
          <p className="mt-2 text-sm">{formatDate(product.updated_at)}</p>
        </div>
        {product.metadata && Object.keys(product.metadata).length > 0 && (
          <div>
            <span className="font-semibold text-xs uppercase tracking-wide">元數據</span>
            <pre className="mt-2 bg-gray-50 p-2 rounded-none border border-gray-200 overflow-x-auto text-xs">
              {JSON.stringify(product.metadata, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default DetailedSpecsTab
