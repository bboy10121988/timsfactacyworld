const axios = require('axios');
const fs = require('fs');

// Medusa API 配置
const MEDUSA_URL = 'http://localhost:9000';

// 建立結果目錄
const resultDir = './api-test-results';
if (!fs.existsSync(resultDir)) {
  fs.mkdirSync(resultDir);
}

// 取得所有產品
async function getAllProducts() {
  try {
    console.log('Getting all products from the store API...');
    const response = await axios.get(`${MEDUSA_URL}/store/products?limit=100`);
    
    // 儲存結果
    fs.writeFileSync(
      `${resultDir}/all-products.json`, 
      JSON.stringify(response.data, null, 2)
    );
    
    console.log(`Found ${response.data.products.length} products in the store`);
    
    // 列出所有產品的標題和 handle
    console.log('Product list:');
    response.data.products.forEach(product => {
      console.log(`- ${product.title} (handle: ${product.handle})`);
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to get products:', error.response?.data || error.message);
    throw error;
  }
}

// 根據 handle 獲取特定產品
async function getProductByHandle(handle) {
  try {
    console.log(`Getting product details for handle: ${handle}`);
    const response = await axios.get(`${MEDUSA_URL}/store/products`, {
      params: { handle }
    });
    
    if (response.data.products.length === 0) {
      console.log(`No product found with handle: ${handle}`);
      return null;
    }
    
    const product = response.data.products[0];
    
    // 儲存結果
    fs.writeFileSync(
      `${resultDir}/product-${handle}.json`, 
      JSON.stringify(product, null, 2)
    );
    
    console.log(`Product found: ${product.title}`);
    console.log(`Variants: ${product.variants.length}`);
    console.log('Variant details:');
    
    // 顯示變體詳情
    product.variants.forEach(variant => {
      const price = variant.prices[0]?.amount || 0;
      const formattedPrice = (price / 100).toFixed(2);
      const options = variant.options.map(opt => `${opt.option.title}: ${opt.value}`).join(', ');
      
      console.log(`- ${variant.title} (SKU: ${variant.sku}, Price: NT$${formattedPrice}, Options: ${options})`);
    });
    
    return product;
  } catch (error) {
    console.error(`Failed to get product by handle ${handle}:`, error.response?.data || error.message);
    throw error;
  }
}

// 主函數
async function main() {
  try {
    // 獲取所有產品
    await getAllProducts();
    
    // 獲取特定產品詳情
    const productHandles = [
      'fantasy-world-hair-wax',
      'blue-tshirt',
      'red-hoodie',
      'fancy-jacket',
      'green-cap'
    ];
    
    for (const handle of productHandles) {
      await getProductByHandle(handle);
      console.log('-----------------------------------');
    }
    
    console.log('Finished product verification');
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

main();
