/**
 * 這個腳本示範如何從 Medusa v2 中獲取商品庫存資訊
 * 先查詢商品變體，再使用 inventory_item_id 查詢庫存
 */

async function checkInventory() {
  try {
    // 獲取商品詳情
    const productResponse = await fetch('http://localhost:9000/store/products/prod_123', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!productResponse.ok) {
      throw new Error(`Failed to fetch product: ${productResponse.statusText}`);
    }
    
    const productData = await productResponse.json();
    console.log('商品資料:', productData);
    
    // 遍歷所有變體，查詢庫存
    for (const variant of productData.product.variants) {
      if (variant.inventory_item_id) {
        // 使用 inventory_item_id 查詢庫存資訊
        const inventoryResponse = await fetch(`http://localhost:9000/store/inventory-items/${variant.inventory_item_id}/availability`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (inventoryResponse.ok) {
          const inventoryData = await inventoryResponse.json();
          console.log(`變體 ${variant.title} 的庫存資訊:`, inventoryData);
          console.log(`可用數量: ${inventoryData.available_quantity}`);
          console.log(`總庫存: ${inventoryData.stocked_quantity}`);
          console.log(`已預留: ${inventoryData.reserved_quantity}`);
          console.log('-----------------------------------');
        } else {
          console.error(`無法獲取變體 ${variant.title} 的庫存資訊: ${inventoryResponse.statusText}`);
        }
      } else {
        console.warn(`變體 ${variant.title} 沒有關聯的庫存項目 (inventory_item_id)`);
      }
    }
  } catch (error) {
    console.error('發生錯誤:', error);
  }
}

// 如果想在 Node.js 中執行此腳本，取消下面的註解
// checkInventory();

// 或者導出函數供前端使用
export default checkInventory;
