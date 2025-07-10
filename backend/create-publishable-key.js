const { Medusa } = require("@medusajs/js-sdk")

async function createPublishableKey() {
  try {
    console.log("🔧 嘗試通過直接 API 請求創建 publishable key...")
    
    // 直接調用 Medusa API 創建 publishable key
    const response = await fetch("http://localhost:9000/admin/publishable-api-keys", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Store Front Key",
      })
    })

    if (response.ok) {
      const data = await response.json()
      console.log("✅ 新的 Publishable Key 已生成:")
      console.log("NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=" + data.publishable_api_key.id)
      return data.publishable_api_key.id
    } else {
      console.log("❌ API 請求失敗，嘗試使用現有的 key...")
      
      // 如果創建失敗，嘗試獲取現有的 keys
      const listResponse = await fetch("http://localhost:9000/admin/publishable-api-keys")
      if (listResponse.ok) {
        const listData = await listResponse.json()
        if (listData.publishable_api_keys && listData.publishable_api_keys.length > 0) {
          const existingKey = listData.publishable_api_keys[0].id
          console.log("📋 找到現有的 Publishable Key:")
          console.log("NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=" + existingKey)
          return existingKey
        }
      }
    }
  } catch (error) {
    console.error("❌ 生成 Publishable Key 失敗:", error.message)
    
    // 提供手動創建的指示
    console.log("\n📝 請手動創建 publishable key:")
    console.log("1. 訪問 http://localhost:9000/app")
    console.log("2. 登入管理面板")
    console.log("3. 導航到 Settings > Publishable API Keys")
    console.log("4. 創建新的 API Key")
    console.log("5. 複製生成的 key 並更新 .env.local 文件")
    
    return null
  }
}

createPublishableKey()
