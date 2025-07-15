import { NextResponse } from 'next/server'

// Mock 商品分類資料
const mockCategories = {
  product_categories: [
    {
      id: 'pcat_01',
      name: '服飾',
      handle: 'clothing',
      description: '各種服飾商品',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
      deleted_at: null,
      parent_category_id: null,
      rank: 0
    },
    {
      id: 'pcat_02',
      name: '配件',
      handle: 'accessories',
      description: '時尚配件',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
      deleted_at: null,
      parent_category_id: null,
      rank: 1
    }
  ],
  count: 2,
  offset: 0,
  limit: 50
}

export async function GET() {
  return NextResponse.json(mockCategories)
}
