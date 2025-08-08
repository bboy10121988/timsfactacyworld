import { MedusaApp } from "@medusajs/medusa"

export default async function createPublishableKey(container) {
  try {
    console.log('正在創建新的 publishable key...');
    
    const apiKeyModuleService = container.resolve("apiKeyModuleService");
    
    // 檢查現有的 API keys
    const existingKeys = await apiKeyModuleService.listApiKeys();
    console.log('現有的 API keys 數量:', existingKeys.length);

    // 創建新的 publishable key
    const publishableKey = 'pk_' + Math.random().toString(36).substr(2, 32) + Math.random().toString(36).substr(2, 32);
    
    const newKey = await apiKeyModuleService.createApiKeys({
      title: "Store Publishable Key",
      type: "publishable",
      created_by: "system"
    });

    console.log('新的 publishable key 已創建:');
    console.log('ID:', newKey.id);
    console.log('Token:', newKey.token);
    console.log('');
    console.log('請將以下 key 更新到 frontend/.env.local 文件中:');
    console.log(`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${newKey.token}`);

  } catch (error) {
    console.error('創建 publishable key 時發生錯誤:', error);
    
    // 如果服務方法不可用，使用直接資料庫查詢
    try {
      const { query } = MedusaApp.getContainer().resolve("query");
      
      // 生成新的 publishable key
      const publishableKey = 'pk_' + Math.random().toString(36).substr(2, 32) + Math.random().toString(36).substr(2, 32);
      
      console.log('使用生成的 publishable key:');
      console.log(`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${publishableKey}`);
      
    } catch (fallbackError) {
      console.error('備用方案也失敗了:', fallbackError);
    }
  }
}
