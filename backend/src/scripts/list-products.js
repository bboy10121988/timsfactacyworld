/**
 * 檢查已匯入的商品清單
 * 使用方式: npx medusa exec list-products.js
 */

module.exports = async ({ container }) => {
  const productService = container.resolve('productService');
  
  // 獲取所有商品，並包含所有相關數據
  const products = await productService.list({}, {
    relations: [
      'variants',
      'variants.prices',
      'variants.options',
      'options',
      'tags',
      'type',
      'collection',
      'images',
      'sales_channels'
    ]
  });

  console.log(`找到 ${products.length} 個商品:`);
  
  // 詳細列出每個商品的資訊
  products.forEach(product => {
    console.log('-----------------------------------------------------------');
    console.log(`ID: ${product.id}`);
    console.log(`Handle: ${product.handle}`);
    console.log(`標題: ${product.title}`);
    console.log(`狀態: ${product.status}`);
    
    // 檢查銷售渠道
    if (product.sales_channels && product.sales_channels.length > 0) {
      console.log('銷售渠道:');
      product.sales_channels.forEach(channel => {
        console.log(`  - ${channel.name} (${channel.id})`);
      });
    } else {
      console.log('銷售渠道: 無 (可能導致前台不顯示)');
    }
    
    // 變體資訊
    console.log(`變體數量: ${product.variants.length}`);
    product.variants.forEach(variant => {
      console.log(`  - ${variant.title} (${variant.id})`);
      
      // 價格資訊
      if (variant.prices && variant.prices.length > 0) {
        variant.prices.forEach(price => {
          const amount = (price.amount / 100).toFixed(2);
          const currency = price.currency_code.toUpperCase();
          console.log(`    價格: ${amount} ${currency}`);
        });
      } else {
        console.log('    價格: 無 (可能導致前台不顯示)');
      }
      
      // 庫存資訊
      if (variant.manage_inventory) {
        console.log(`    庫存管理: 開啟`);
        console.log(`    庫存數量: ${variant.inventory_quantity}`);
        console.log(`    允許缺貨預訂: ${variant.allow_backorder ? '是' : '否'}`);
      } else {
        console.log(`    庫存管理: 關閉`);
      }
    });
    
    console.log('-----------------------------------------------------------');
  });
  
  return products.length;
};
