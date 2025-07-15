import { NextResponse } from 'next/server'

// Mock 地區資料
const mockRegions = {
  regions: [
    {
      id: 'reg_01',
      name: '台灣',
      currency_code: 'twd',
      tax_rate: 0,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
      deleted_at: null,
      countries: [
        {
          id: 'country_01',
          iso_2: 'tw',
          iso_3: 'twn',
          num_code: 158,
          name: '台灣',
          display_name: '台灣',
          region_id: 'reg_01'
        }
      ],
      payment_providers: [],
      fulfillment_providers: []
    }
  ],
  count: 1,
  offset: 0,
  limit: 50
}

export async function GET() {
  return NextResponse.json(mockRegions)
}
