"use client"

import { useState, useEffect } from "react"

type ProductTestProps = {
  productId: string
}

const ProductInventoryTest = ({ productId }: ProductTestProps) => {
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 模擬不同的庫存情況
  const [testCases, setTestCases] = useState([
    {
      id: 1,
      label: "原始庫存狀態",
      variants: [] as any[],
    },
    {
      id: 2,
      label: "全部設置為不管理庫存",
      variants: [] as any[],
    },
    {
      id: 3,
      label: "全部設置為允許缺貨訂購",
      variants: [] as any[],
    },
    {
      id: 4,
      label: "全部設置為有庫存",
      variants: [] as any[],
    },
  ])

  // 獲取產品數據
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/test-inventory?productId=${productId}`)
        if (!response.ok) {
          throw new Error("無法獲取產品數據")
        }
        const data = await response.json()
        setProduct(data.product)
        
        // 更新測試案例
        if (data.product?.variants) {
          setTestCases(prev => {
            const updatedCases = [...prev]
            
            // 案例 1: 原始狀態
            updatedCases[0].variants = data.product.variants.map((v: any) => ({
              ...v,
              statusMessage: getStockStatusMessage(v)
            }))
            
            // 案例 2: 不管理庫存
            updatedCases[1].variants = data.product.variants.map((v: any) => ({
              ...v,
              manage_inventory: false,
              statusMessage: getStockStatusMessage({...v, manage_inventory: false})
            }))
            
            // 案例 3: 允許缺貨訂購
            updatedCases[2].variants = data.product.variants.map((v: any) => ({
              ...v,
              allow_backorder: true,
              statusMessage: getStockStatusMessage({...v, allow_backorder: true})
            }))
            
            // 案例 4: 有庫存
            updatedCases[3].variants = data.product.variants.map((v: any) => ({
              ...v,
              inventory_quantity: 10,
              statusMessage: getStockStatusMessage({...v, inventory_quantity: 10})
            }))
            
            return updatedCases
          })
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : "發生未知錯誤")
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  // 檢查庫存狀態的函數 (與我們的前端邏輯相同)
  function getStockStatusMessage(variant: any) {
    const hasStock = !variant.manage_inventory || 
                     variant.allow_backorder || 
                     (variant.inventory_quantity !== undefined && variant.inventory_quantity > 0)
    
    return hasStock ? "有庫存" : "缺貨"
  }

  if (loading) return <div className="p-4">載入中...</div>
  if (error) return <div className="p-4 text-red-500">錯誤: {error}</div>
  if (!product) return <div className="p-4">找不到產品</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{product.title} - 庫存測試</h1>
      
      <div className="grid grid-cols-1 gap-8">
        {testCases.map(testCase => (
          <div key={testCase.id} className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">{testCase.label}</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">變體名稱</th>
                    <th className="px-4 py-2 text-left">管理庫存</th>
                    <th className="px-4 py-2 text-left">允許缺貨訂購</th>
                    <th className="px-4 py-2 text-left">庫存數量</th>
                    <th className="px-4 py-2 text-left">庫存狀態</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {testCase.variants.map((variant: any) => (
                    <tr key={variant.id}>
                      <td className="px-4 py-2">{variant.title}</td>
                      <td className="px-4 py-2">{variant.manage_inventory ? '是' : '否'}</td>
                      <td className="px-4 py-2">{variant.allow_backorder ? '是' : '否'}</td>
                      <td className="px-4 py-2">{variant.inventory_quantity}</td>
                      <td className="px-4 py-2">
                        <span className={variant.statusMessage === '有庫存' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {variant.statusMessage}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductInventoryTest
