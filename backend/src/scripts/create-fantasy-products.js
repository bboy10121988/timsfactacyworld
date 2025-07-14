const axios = require('axios');
const fs = require('fs');

// Medusa API 配置
const MEDUSA_URL = 'http://localhost:9000';
const ADMIN_EMAIL = 'admin@example.com'; // 更改為您的管理員電子郵件
const ADMIN_PASSWORD = 'supersecret';    // 更改為您的管理員密碼

// Fantasy World 水凝髮蠟產品資料
const products = [
  {
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
      { url: "http://localhost:9000/static/1748496657726-2022_10_21-timsfantasy-10520-1.jpeg" }
    ],
    options: [
      { title: "尺寸", values: ["S", "M", "L"] },
      { title: "顏色", values: ["紅色", "綠色", "黃色"] }
    ],
    variants: [
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
    ],
    // 額外的標籤和類別
    tags: [
      { value: "髮型產品" },
      { value: "造型產品" },
      { value: "Fantasy" }
    ],
    // 可以關聯到已存在的集合
    collection_id: null // 如果有特定集合ID，可以在這裡添加
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

// 主函數
async function main() {
  try {
    // 獲取 Token
    const token = await getAdminToken();
    console.log('Admin token obtained successfully');
    
    // 依次創建每個產品
    for (const product of products) {
      console.log(`Creating product: ${product.title}`);
      const result = await createProduct(product, token);
      console.log(`Product created: ${result.product.id}`);
      
      // 記錄詳細的返回結果，以便診斷任何問題
      fs.writeFileSync(
        `product-creation-result-${result.product.handle}.json`, 
        JSON.stringify(result, null, 2)
      );
    }
    
    console.log('All products created successfully');
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

main();
