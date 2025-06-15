const axios = require('axios');
const fs = require('fs');

// Medusa API 配置
const MEDUSA_URL = 'http://localhost:9000';
const ADMIN_EMAIL = 'admin@example.com'; // 更改為您的管理員電子郵件
const ADMIN_PASSWORD = 'supersecret';    // 更改為您的管理員密碼

// Fantasy World 水凝髮蠟產品資料 - 根據實際 JSON 結構精確建立
const fantasyProduct = {
  title: "Fantasy World 水凝髮蠟",
  subtitle: "專業級造型產品",
  description: "Fantasy World 水凝髮蠟提供完美定型效果，不黏膩，易於清洗，適合各種髮型設計。水凝配方保護頭髮健康，不造成頭髮負擔。",
  handle: "fantasy-world-hair-wax",
  status: "published",
  thumbnail: "http://localhost:9000/static/1748496657726-2022_10_21-timsfantasy-10520-1.jpeg",
  material: "水凝配方",
  discountable: true,
  weight: 150,
  images: [
    { url: "http://localhost:9000/static/1748496657726-2022_10_21-timsfantasy-10520-1.jpeg" },
    { url: "http://localhost:9000/static/1748496625279-2022_10_21-timsfantasy-10520-1.jpeg" },
    { url: "http://localhost:9000/static/1748496640987-2022_10_21-timsfantasy-10520-1.jpeg" }
  ],
  options: [
    { title: "尺寸", values: ["S", "M", "L"] },
    { title: "顏色", values: ["紅色", "綠色", "黃色"] }
  ],
  // 標籤
  tags: [
    { value: "髮型產品" },
    { value: "造型產品" },
    { value: "Fantasy" }
  ],
  // 只定義變體，稍後會進行建立
  variants: []
};

// 變體定義 - 與 JSON 結構相符
const fantasyVariants = [
  {
    title: "紅S",
    sku: "FANTASY-RED-S",
    prices: [{ amount: 28000, currency_code: "twd" }],
    options: { "尺寸": "S", "顏色": "紅色" },
    manage_inventory: true,
    allow_backorder: false,
    inventory_quantity: 50
  },
  {
    title: "紅M",
    sku: "FANTASY-RED-M",
    prices: [{ amount: 32000, currency_code: "twd" }],
    options: { "尺寸": "M", "顏色": "紅色" },
    manage_inventory: true,
    allow_backorder: false,
    inventory_quantity: 50
  },
  {
    title: "紅L",
    sku: "FANTASY-RED-L",
    prices: [{ amount: 36000, currency_code: "twd" }],
    options: { "尺寸": "L", "顏色": "紅色" },
    manage_inventory: true,
    allow_backorder: false,
    inventory_quantity: 50
  },
  {
    title: "綠S",
    sku: "FANTASY-GREEN-S",
    prices: [{ amount: 28000, currency_code: "twd" }],
    options: { "尺寸": "S", "顏色": "綠色" },
    manage_inventory: true,
    allow_backorder: false,
    inventory_quantity: 50
  },
  {
    title: "綠M",
    sku: "FANTASY-GREEN-M",
    prices: [{ amount: 32000, currency_code: "twd" }],
    options: { "尺寸": "M", "顏色": "綠色" },
    manage_inventory: true,
    allow_backorder: false,
    inventory_quantity: 50
  },
  {
    title: "綠L",
    sku: "FANTASY-GREEN-L",
    prices: [{ amount: 36000, currency_code: "twd" }],
    options: { "尺寸": "L", "顏色": "綠色" },
    manage_inventory: true,
    allow_backorder: false,
    inventory_quantity: 50
  },
  {
    title: "黃S",
    sku: "FANTASY-YELLOW-S",
    prices: [{ amount: 28000, currency_code: "twd" }],
    options: { "尺寸": "S", "顏色": "黃色" },
    manage_inventory: true,
    allow_backorder: false,
    inventory_quantity: 50
  },
  {
    title: "黃M",
    sku: "FANTASY-YELLOW-M",
    prices: [{ amount: 32000, currency_code: "twd" }],
    options: { "尺寸": "M", "顏色": "黃色" },
    manage_inventory: true,
    allow_backorder: false,
    inventory_quantity: 50
  },
  {
    title: "黃L",
    sku: "FANTASY-YELLOW-L",
    prices: [{ amount: 36000, currency_code: "twd" }],
    options: { "尺寸": "L", "顏色": "黃色" },
    manage_inventory: true,
    allow_backorder: false,
    inventory_quantity: 50
  }
];

// 獲取管理員 Token
async function getAdminToken() {
  try {
    const response = await axios.post(`${MEDUSA_URL}/admin/auth`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Failed to get admin token:', error.response?.data || error.message);
    throw error;
  }
}

// 創建產品
async function createProduct(product, token) {
  try {
    // 首先創建基本產品，不包含變體
    const response = await axios.post(
      `${MEDUSA_URL}/admin/products`,
      product,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to create product ${product.title}:`, error.response?.data || error.message);
    throw error;
  }
}

// 添加產品變體
async function addProductVariants(productId, variants, token) {
  try {
    // 逐一添加每個變體
    for (const variant of variants) {
      console.log(`Adding variant: ${variant.title} to product ${productId}`);
      
      // 準備變體數據
      const variantData = {
        title: variant.title,
        sku: variant.sku,
        prices: variant.prices,
        options: Object.entries(variant.options).map(([name, value]) => ({ value })),
        manage_inventory: variant.manage_inventory,
        allow_backorder: variant.allow_backorder,
        inventory_quantity: variant.inventory_quantity
      };
      
      // 發送 POST 請求添加變體
      const response = await axios.post(
        `${MEDUSA_URL}/admin/products/${productId}/variants`,
        { variant: variantData },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log(`Variant added: ${response.data.product.variants.slice(-1)[0].id}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to add variants:`, error.response?.data || error.message);
    throw error;
  }
}

// 查詢產品庫存
async function getProductInventory(productId, token) {
  try {
    const response = await axios.get(
      `${MEDUSA_URL}/admin/products/${productId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data.product;
  } catch (error) {
    console.error(`Failed to get product inventory:`, error.response?.data || error.message);
    throw error;
  }
}

// 主函數
async function main() {
  try {
    // 獲取 Token
    const token = await getAdminToken();
    console.log('Admin token obtained successfully');
    
    // 建立產品結果儲存目錄
    const resultDir = './product-creation-results';
    if (!fs.existsSync(resultDir)) {
      fs.mkdirSync(resultDir);
    }
    
    // 將變體添加到產品對象
    fantasyProduct.variants = fantasyVariants;
    
    // 創建產品
    console.log(`Creating product: ${fantasyProduct.title}`);
    const result = await createProduct(fantasyProduct, token);
    const productId = result.product.id;
    console.log(`Product created: ${productId}`);
    
    // 記錄詳細的返回結果
    fs.writeFileSync(
      `${resultDir}/product-creation-result-${result.product.handle}.json`, 
      JSON.stringify(result, null, 2)
    );
    
    // 查詢創建的產品，確認變體是否正確創建
    console.log('Verifying product inventory...');
    const productWithInventory = await getProductInventory(productId, token);
    fs.writeFileSync(
      `${resultDir}/product-inventory-${result.product.handle}.json`, 
      JSON.stringify(productWithInventory, null, 2)
    );
    
    console.log('Product created successfully with variants');
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

main();
