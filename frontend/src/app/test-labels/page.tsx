'use client'

import { useState, useEffect } from 'react'
import { HttpTypes } from "@medusajs/types"
import { getActivePromotionLabels } from '@lib/simple-promotion-utils'

interface Product {
  id: string
  title: string
  handle: string
  description?: string
  variants?: Array<{
    id: string
    title: string
    calculated_price?: {
      original_amount: number
      calculated_amount: number
      currency_code: string
    }
  }>
  metadata?: Record<string, any>
  tags?: Array<{ value: string }>
}

interface PromotionLabel {
  type: string
  text: string
  priority: number
  className: string
  isDiscount?: boolean
}

export default function TestLabelsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [promotionLabels, setPromotionLabels] = useState<Record<string, PromotionLabel[]>>({})
  const [testingProduct, setTestingProduct] = useState<string | null>(null)

  // 獲取商品列表
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/store/products?limit=10')
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products || [])
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // 測試特定商品的促銷標籤
  const testProductLabels = async (product: Product) => {
    setTestingProduct(product.id)
    try {
      console.log('Testing labels for product:', product.title)
      
      // 使用 Medusa API 獲取真實促銷標籤
      const labels = await getActivePromotionLabels(product as HttpTypes.StoreProduct)
      
      setPromotionLabels(prev => ({
        ...prev,
        [product.id]: labels
      }))
      
      console.log(`【${product.title}】促銷標籤結果:`, labels)
    } catch (error) {
      console.error('Error testing labels:', error)
      setPromotionLabels(prev => ({
        ...prev,
        [product.id]: []
      }))
    } finally {
      setTestingProduct(null)
    }
  }

  // 一次測試所有商品
  const testAllProducts = async () => {
    for (const product of products) {
      await testProductLabels(product)
      // 間隔一點時間避免 API 負載過大
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">載入中...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">🏷️ Medusa API 折扣標籤展示</h1>
        <p className="text-gray-600 mb-4">
          此頁面只顯示來自 Medusa 促銷模組的真實折扣標籤，不包含其他來源的標籤
        </p>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={testAllProducts}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={testingProduct !== null}
          >
            {testingProduct ? '測試中...' : '測試所有商品'}
          </button>
          
          <button
            onClick={() => setPromotionLabels({})}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            清除結果
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center text-gray-500">
          沒有找到商品資料
        </div>
      ) : (
        <div className="grid gap-6">
          {products.map((product) => (
            <div key={product.id} className="border rounded-lg p-6 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{product.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">ID: {product.id}</p>
                  {product.description && (
                    <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                  )}
                </div>
                
                <button
                  onClick={() => testProductLabels(product)}
                  disabled={testingProduct === product.id}
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:bg-gray-400"
                >
                  {testingProduct === product.id ? '測試中...' : '測試標籤'}
                </button>
              </div>

              {/* 商品變體價格資訊 */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">變體價格：</h4>
                  <div className="space-y-1">
                    {product.variants.map((variant) => (
                      <div key={variant.id} className="text-sm">
                        <span className="font-medium">{variant.title}: </span>
                        {variant.calculated_price ? (
                          <span>
                            原價 NT${variant.calculated_price.original_amount} → 
                            實際 NT${variant.calculated_price.calculated_amount}
                            {variant.calculated_price.original_amount > variant.calculated_price.calculated_amount && (
                              <span className="text-red-500 ml-2">
                                (-{Math.round(((variant.calculated_price.original_amount - variant.calculated_price.calculated_amount) / variant.calculated_price.original_amount) * 100)}%)
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-gray-400">無價格資訊</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata 資訊 */}
              {product.metadata && Object.keys(product.metadata).length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Metadata：</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                    {JSON.stringify(product.metadata, null, 2)}
                  </pre>
                </div>
              )}

              {/* Tags 資訊 */}
              {product.tags && product.tags.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Tags：</h4>
                  <div className="flex gap-2 flex-wrap">
                    {product.tags.map((tag, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {tag.value}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">🏷️ Medusa API 折扣標籤：</h4>
                {promotionLabels[product.id] ? (
                  promotionLabels[product.id].length > 0 ? (
                    <div className="space-y-2">
                      {promotionLabels[product.id].map((label, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-green-50 rounded border border-green-200">
                          <div className={label.className || 'gold-badge-circle'}>
                            {label.text}
                          </div>
                          <div className="text-sm text-green-700">
                            類型: <code className="bg-green-100 px-1 rounded">{label.type}</code> | 
                            優先級: {label.priority} | 
                            Medusa折扣: {label.isDiscount ? '✅' : '❌'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-orange-600 italic p-2 bg-orange-50 rounded">
                      📭 此商品沒有 Medusa 促銷活動
                    </div>
                  )
                ) : (
                  <div className="text-gray-400">點擊「測試標籤」按鈕查看結果</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 開發提示 */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
        <h4 className="font-medium text-blue-800 mb-2">💡 Medusa API 折扣標籤說明：</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 只顯示來自 Medusa 促銷模組的真實折扣標籤</li>
          <li>• 如果沒有 Medusa 促銷活動，不會顯示任何標籤</li>
          <li>• 標籤基於實際購物車測試，確保準確性</li>
          <li>• 打開瀏覽器開發者工具查看詳細 API 日誌</li>
        </ul>
      </div>
    </div>
  )
}
