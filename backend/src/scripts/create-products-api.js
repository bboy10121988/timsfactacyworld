const axios = require('axios');
const fs = require('fs');

// Medusa API 配置
const MEDUSA_URL = 'http://localhost:9000';
const ADMIN_EMAIL = 'admin@example.com'; // 更改為您的管理員電子郵件
const ADMIN_PASSWORD = 'supersecret';    // 更改為您的管理員密碼

// 產品資料
const products = [
  {
    title: "藍色 T-Shirt",
    subtitle: "超柔軟面料",
    description: "採用高品質棉料製成的舒適 T-Shirt，適合日常穿著和休閒搭配",
    handle: "blue-tshirt",
    status: "published",
    thumbnail: "http://localhost:9000/static/1749881981292-%C3%A4%C2%B8%C2%80%C3%A6%C2%B3%C2%8A%C3%A4%C2%BA%C2%8C%C3%A9%C2%A3%C2%9F.png",
    material: "棉質",
    discountable: true,
    weight: 180,
    images: [
      { url: "http://localhost:9000/static/1749881981292-%C3%A4%C2%B8%C2%80%C3%A6%C2%B3%C2%8A%C3%A4%C2%BA%C2%8C%C3%A9%C2%A3%C2%9F.png" }
    ],
    options: [
      { title: "尺寸", values: ["S", "M", "L"] },
      { title: "顏色", values: ["藍色"] }
    ],
    variants: [
      {
        title: "S",
        sku: "BLUE-TSHIRT-S",
        prices: [{ amount: 45000, currency_code: "twd" }], // 450元，以分為單位
        options: { "尺寸": "S", "顏色": "藍色" },
        manage_inventory: true,
        allow_backorder: false,
        inventory_quantity: 100
      },
      {
        title: "M",
        sku: "BLUE-TSHIRT-M",
        prices: [{ amount: 45000, currency_code: "twd" }],
        options: { "尺寸": "M", "顏色": "藍色" },
        manage_inventory: true,
        allow_backorder: false,
        inventory_quantity: 100
      },
      {
        title: "L",
        sku: "BLUE-TSHIRT-L",
        prices: [{ amount: 45000, currency_code: "twd" }],
        options: { "尺寸": "L", "顏色": "藍色" },
        manage_inventory: true,
        allow_backorder: false,
        inventory_quantity: 100
      }
    ]
  },
  {
    title: "紅色連帽衫",
    subtitle: "舒適保暖",
    description: "採用優質混紡面料，適合秋冬季節穿著的連帽衫，保暖舒適，經典款式",
    handle: "red-hoodie",
    status: "published",
    thumbnail: "http://localhost:9000/static/1748573049256-Tim_s-%C3%A5%C2%95%C2%86%C3%A5%C2%93%C2%81%C3%A5%C2%8E%C2%BB%C3%A8%C2%83%C2%8C%C3%A7%C2%85%C2%A7-red%C3%A5%C2%B0%C2%8F.png",
    material: "混紡",
    discountable: true,
    weight: 350,
    images: [
      { url: "http://localhost:9000/static/1748573049256-Tim_s-%C3%A5%C2%95%C2%86%C3%A5%C2%93%C2%81%C3%A5%C2%8E%C2%BB%C3%A8%C2%83%C2%8C%C3%A7%C2%85%C2%A7-red%C3%A5%C2%B0%C2%8F.png" }
    ],
    options: [
      { title: "尺寸", values: ["S", "M", "L"] },
      { title: "顏色", values: ["紅色"] }
    ],
    variants: [
      {
        title: "S",
        sku: "RED-HOODIE-S",
        prices: [{ amount: 78000, currency_code: "twd" }],
        options: { "尺寸": "S", "顏色": "紅色" },
        manage_inventory: true,
        allow_backorder: true,
        inventory_quantity: 100
      },
      {
        title: "M",
        sku: "RED-HOODIE-M",
        prices: [{ amount: 78000, currency_code: "twd" }],
        options: { "尺寸": "M", "顏色": "紅色" },
        manage_inventory: true,
        allow_backorder: true,
        inventory_quantity: 100
      },
      {
        title: "L",
        sku: "RED-HOODIE-L",
        prices: [{ amount: 78000, currency_code: "twd" }],
        options: { "尺寸": "L", "顏色": "紅色" },
        manage_inventory: true,
        allow_backorder: true,
        inventory_quantity: 100
      }
    ]
  },
  {
    title: "時尚外套",
    subtitle: "高級面料",
    description: "高級面料製作的時尚外套，適合正式場合穿著，質感優越",
    handle: "fancy-jacket",
    status: "published",
    thumbnail: "http://localhost:9000/static/1748573182673-IMG_4046-Edit-Edit-Edit.jpg",
    material: "羊毛",
    discountable: true,
    weight: 450,
    images: [
      { url: "http://localhost:9000/static/1748573182673-IMG_4046-Edit-Edit-Edit.jpg" }
    ],
    options: [
      { title: "尺寸", values: ["S", "M", "L"] },
      { title: "顏色", values: ["黑色"] }
    ],
    variants: [
      {
        title: "S",
        sku: "FANCY-JACKET-S",
        prices: [{ amount: 220000, currency_code: "twd" }],
        options: { "尺寸": "S", "顏色": "黑色" },
        manage_inventory: true,
        allow_backorder: false,
        inventory_quantity: 100
      },
      {
        title: "M",
        sku: "FANCY-JACKET-M",
        prices: [{ amount: 220000, currency_code: "twd" }],
        options: { "尺寸": "M", "顏色": "黑色" },
        manage_inventory: true,
        allow_backorder: false,
        inventory_quantity: 100
      },
      {
        title: "L",
        sku: "FANCY-JACKET-L",
        prices: [{ amount: 220000, currency_code: "twd" }],
        options: { "尺寸": "L", "顏色": "黑色" },
        manage_inventory: true,
        allow_backorder: false,
        inventory_quantity: 100
      }
    ]
  },
  {
    title: "綠色棒球帽",
    subtitle: "經典棒球帽",
    description: "經典款式的可調節棒球帽，適合日常休閒搭配，戶外活動",
    handle: "green-cap",
    status: "published",
    thumbnail: "http://localhost:9000/static/1748572828778-Tim_s-%C3%A5%C2%95%C2%86%C3%A5%C2%93%C2%81%C3%A5%C2%8E%C2%BB%C3%A8%C2%83%C2%8C%C3%A7%C2%85%C2%A7-green.png",
    material: "棉質",
    discountable: true,
    weight: 100,
    images: [
      { url: "http://localhost:9000/static/1748572828778-Tim_s-%C3%A5%C2%95%C2%86%C3%A5%C2%93%C2%81%C3%A5%C2%8E%C2%BB%C3%A8%C2%83%C2%8C%C3%A7%C2%85%C2%A7-green.png" }
    ],
    options: [
      { title: "尺寸", values: ["單一尺寸"] },
      { title: "顏色", values: ["綠色"] }
    ],
    variants: [
      {
        title: "單一尺寸",
        sku: "GREEN-CAP-ONE",
        prices: [{ amount: 35000, currency_code: "twd" }],
        options: { "尺寸": "單一尺寸", "顏色": "綠色" },
        manage_inventory: true,
        allow_backorder: false,
        inventory_quantity: 100
      }
    ]
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
    }
    
    console.log('All products created successfully');
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

main();
