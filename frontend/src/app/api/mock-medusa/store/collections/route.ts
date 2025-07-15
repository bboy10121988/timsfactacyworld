import { NextResponse } from 'next/server'

// Mock 商品系列資料
const mockCollections = {
  collections: [
    {
      id: 'pcol_01',
      title: '夏季新品',
      handle: 'summer-collection',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
      deleted_at: null
    },
    {
      id: 'pcol_02',
      title: '經典系列',
      handle: 'classic-collection',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
      deleted_at: null
    }
  ],
  count: 2,
  offset: 0,
  limit: 50
}

export async function GET() {
  return NextResponse.json(mockCollections)
}
