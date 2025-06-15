const { default: axios } = require("axios")

async function getProductInventory() {
  try {
    // 設置 Medusa API 基本 URL
    const baseURL = "http://localhost:9000"
    
    // 使用 Admin API 查詢商品
    // 首先需要登錄獲取 Cookie
    const loginResponse = await axios.post(`${baseURL}/admin/auth`, {
      email: "admin@example.com",  // 請替換為您的管理員郵箱
      password: "supersecret"      // 請替換為您的管理員密碼
    })
    
    const cookies = loginResponse.headers['set-cookie']
    console.log("登錄成功，獲取到 Cookie")
    
    // 使用 Cookie 查詢商品
    const productResponse = await axios.get(
      `${baseURL}/admin/products/prod_01JWFGZX3RDSS1JWZVZAQFJGR6`, 
      {
        headers: {
          Cookie: cookies
        },
        params: {
          expand: "variants,variants.inventory_items",
        }
      }
    )
    
    console.log("商品信息:")
    console.log(JSON.stringify(productResponse.data.product, null, 2))
    
    // 查詢庫存
    if (productResponse.data.product && productResponse.data.product.variants) {
      console.log("\n庫存信息:")
      
      for (const variant of productResponse.data.product.variants) {
        console.log(`變體 ID: ${variant.id}`)
        console.log(`變體名稱: ${variant.title}`)
        console.log(`庫存: ${variant.inventory_quantity}`)
        console.log("-------------------")
      }
    }
  } catch (error) {
    console.error("查詢失敗:", error.message)
    if (error.response) {
      console.error("響應數據:", error.response.data)
    }
  }
}

getProductInventory()
