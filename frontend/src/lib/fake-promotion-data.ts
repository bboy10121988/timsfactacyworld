// 測試促銷標籤的假資料
export const FAKE_PROMOTION_LABELS = {
  // 測試不同產品 ID 對應的促銷標籤
  'prod_01JWFGZX3RDSS1JWZVZAQFJGR6': [
    {
      type: 'auto-discount',
      text: '20% OFF',
      className: 'product-label discount'
    }
  ],
  'prod_01JWFH6MDQDRVC3YCTPE89S9J3': [
    {
      type: 'hot',
      text: 'HOT',
      className: 'product-label hot'
    }
  ],
  'prod_01JWFH735V1RDMXQV2CPMXQBHX': [
    {
      type: 'new',
      text: 'NEW',
      className: 'product-label new'
    }
  ],
  'prod_01JWFH84YGAB1CCD4FVG3Z4S8C': [
    {
      type: 'limited',
      text: 'LIMITED',
      className: 'product-label limited'
    },
    {
      type: 'sold-out',
      text: 'SOLD OUT',
      className: 'product-label sold-out'
    }
  ]
}

// 測試庫存狀態
export const FAKE_STOCK_STATUS = {
  'prod_01JWFH84YGAB1CCD4FVG3Z4S8C': {
    isOutOfStock: true,
    canPreorder: false,
    isSoldOut: true,
    hasStock: false
  }
}
