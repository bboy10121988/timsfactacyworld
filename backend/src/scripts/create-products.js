const axios = require('axios');

// 設定基本 API 資訊
const BASE_URL = 'http://localhost:9000';
const ADMIN_EMAIL = 'admin@example.com'; // 替換為你的管理員電子郵件
const ADMIN_PASSWORD = 'supersecret'; // 替換為你的管理員密碼

// 產品資料
const products = [
  {
    title: "藍色 T-Shirt",
    subtitle: "超柔軟面料",
    description: "採用高品質棉料製成的舒適 T-Shirt，適合日常穿著和休閒搭配",
    handle: "blue-tshirt",
    status: "published",
    material: "棉質",
    weight: 180,
    type: {
      value: "T-Shirt"
    },
    tags: [{ value: "休閒" }],
    options: [
      { title: "Size" },
      { title: "Color" }
    ],
    variants: [
      {
        title: "S",
        sku: "BLUE-TSHIRT-S",
        allow_backorder: false,
        manage_inventory: true,
        weight: 180,
        material: "棉質",
        options: [
          { value: "S" },
          { value: "Blue" }
        ],
        prices: [
          { amount: 450, currency_code: "eur" },
          { amount: 450, currency_code: "usd" }
        ]
      },
      {
        title: "M",
        sku: "BLUE-TSHIRT-M",
        allow_backorder: false,
        manage_inventory: true,
        weight: 180,
        material: "棉質",
        options: [
          { value: "M" },
          { value: "Blue" }
        ],
        prices: [
          { amount: 450, currency_code: "eur" },
          { amount: 450, currency_code: "usd" }
        ]
      },
      {
        title: "L",
        sku: "BLUE-TSHIRT-L",
        allow_backorder: false,
        manage_inventory: true,
        weight: 180,
        material: "棉質",
        options: [
          { value: "L" },
          { value: "Blue" }
        ],
        prices: [
          { amount: 450, currency_code: "eur" },
          { amount: 450, currency_code: "usd" }
        ]
      }
    ],
    thumbnail: "http://localhost:9000/static/1749881981292-%C3%A4%C2%B8%C2%80%C3%A6%C2%B3%C2%8A%C3%A4%C2%BA%C2%8C%C3%A9%C2%A3%C2%9F.png",
    images: [
      {
        url: "http://localhost:9000/static/1749881981292-%C3%A4%C2%B8%C2%80%C3%A6%C2%B3%C2%8A%C3%A4%C2%BA%C2%8C%C3%A9%C2%A3%C2%9F.png"
      }
    ]
  },
  // 可以繼續添加更多產品...
];

async function main() {
  try {
    // 1. 管理員登入以獲取訪問 token
    console.log('正在登入管理員帳戶...');
    const { data: { access_token } } = await axios.post(`${BASE_URL}/admin/auth`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    console.log('登入成功，開始創建產品...');
    
    // 2. 逐一創建產品
    for (const product of products) {
      try {
        const response = await axios.post(`${BASE_URL}/admin/products`, product, {
          headers: {
            Authorization: `Bearer ${access_token}`
          }
        });
        
        console.log(`產品「${product.title}」創建成功! ID: ${response.data.product.id}`);
      } catch (err) {
        console.error(`產品「${product.title}」創建失敗:`, err.response?.data?.message || err.message);
      }
    }
    
    console.log('所有產品處理完畢');
    
  } catch (error) {
    console.error('發生錯誤:', error.response?.data?.message || error.message);
  }
}

// 執行主函數
main();
