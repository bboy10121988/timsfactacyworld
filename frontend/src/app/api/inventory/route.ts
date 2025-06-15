import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const variantId = searchParams.get('variant_id')
  
  if (!variantId) {
    return NextResponse.json({ error: 'Variant ID is required' }, { status: 400 })
  }

  try {
    // 這裡應該調用 Medusa Admin API 來獲取庫存信息
    // 由於需要管理員權限，我們暫時返回模擬數據
    
    // 模擬庫存數據 - 在實際環境中應該從數據庫獲取
    const mockInventoryData = {
      [variantId]: {
        available_quantity: 100,
        reserved_quantity: 5,
        stocked_quantity: 105
      }
    }

    const inventoryInfo = mockInventoryData[variantId] || {
      available_quantity: 0,
      reserved_quantity: 0,
      stocked_quantity: 0
    }

    return NextResponse.json(inventoryInfo)
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 })
  }
}
