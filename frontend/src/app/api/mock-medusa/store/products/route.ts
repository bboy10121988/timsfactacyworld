import { NextResponse } from 'next/server'

// Mock 商品資料
const mockProducts = {
  products: [
    {
      id: 'prod_01',
      title: 'T-shirt',
      description: '舒適的棉質 T-shirt',
      handle: 'product-1',
      status: 'published',
      images: [
        {
          id: 'img_01',
          url: 'https://via.placeholder.com/400x400?text=T-shirt'
        }
      ],
      variants: [
        {
          id: 'variant_01',
          title: 'Default',
          prices: [
            {
              id: 'price_01',
              currency_code: 'twd',
              amount: 99900,
              region_id: 'reg_01'
            }
          ],
          inventory_quantity: 10
        }
      ],
      thumbnail: 'https://via.placeholder.com/400x400?text=T-shirt'
    },
    {
      id: 'prod_02',
      title: 'Jeans',
      description: '經典藍色牛仔褲',
      handle: 'product-2',
      status: 'published',
      images: [
        {
          id: 'img_02',
          url: 'https://via.placeholder.com/400x400?text=Jeans'
        }
      ],
      variants: [
        {
          id: 'variant_02',
          title: 'Default',
          prices: [
            {
              id: 'price_02',
              currency_code: 'twd',
              amount: 299900,
              region_id: 'reg_01'
            }
          ],
          inventory_quantity: 5
        }
      ],
      thumbnail: 'https://via.placeholder.com/400x400?text=Jeans'
    }
  ],
  count: 2,
  offset: 0,
  limit: 50
}

export async function GET() {
  return NextResponse.json(mockProducts)
}
