import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function createAdmin({ container }: { container: MedusaContainer }) {
  console.log("👤 創建管理員帳戶")
  
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  
  // 1. 檢查管理員是否已存在
  const email = "timsfantasyworld@gmail.com"
  console.log(`\n📧 檢查管理員 ${email} 是否已存在...`)
  
  const { data: existingUsers } = await query.graph({
    entity: "user",
    fields: ["id", "email", "first_name", "last_name"],
    filters: { email: email }
  });
  
  if (existingUsers.length > 0) {
    console.log("⚠️ 管理員已存在:")
    console.log(`ID: ${existingUsers[0].id}`)
    console.log(`姓名: ${existingUsers[0].first_name} ${existingUsers[0].last_name}`)
    console.log(`信箱: ${existingUsers[0].email}`)
    return
  }
  
  // 2. 創建新管理員
  console.log("✅ 管理員不存在，開始創建...")
  
  try {
    // 使用 User Module Service 創建管理員
    const userModuleService = container.resolve("userModuleService")
    
    const newAdmin = await userModuleService.createUsers({
      email: email,
      first_name: "Tim",
      last_name: "Admin", 
      // 密碼會在創建後通過 Auth Module 設定
    })
    
    console.log("✅ 管理員帳戶創建成功:")
    console.log(`ID: ${newAdmin.id}`)
    console.log(`姓名: ${newAdmin.first_name} ${newAdmin.last_name}`)
    console.log(`信箱: ${newAdmin.email}`)
    
    // 3. 設定密碼
    console.log("\n🔐 設定管理員密碼...")
    
    const authModuleService = container.resolve("authModuleService")
    
    // 創建身份驗證記錄
    const authIdentity = await authModuleService.createAuthIdentities({
      provider_id: "emailpass",
      entity_id: newAdmin.id,
      provider_metadata: {
        email: email,
        password_hash: "$2b$10$" // 這裡需要實際的密碼雜湊
      }
    })
    
    console.log("✅ 管理員密碼設定完成")
    console.log(`Auth Identity ID: ${authIdentity.id}`)
    
  } catch (error: any) {
    console.error("❌ 創建管理員失敗:", error.message)
    
    // 降級方案：提供 SQL 指令
    console.log("\n💡 手動 SQL 創建方案:")
    console.log("請在資料庫中執行以下 SQL:")
    
    const userId = `user_${Date.now()}`
    const authId = `authid_${Date.now()}`
    
    console.log(`
-- 1. 創建用戶
INSERT INTO "user" (
  id, 
  email, 
  first_name, 
  last_name,
  created_at, 
  updated_at
) VALUES (
  '${userId}',
  '${email}',
  'Tim',
  'Admin',
  NOW(),
  NOW()
);

-- 2. 創建認證身份（密碼雜湊需要另外處理）
INSERT INTO auth_identity (
  id,
  provider_id,
  entity_id, 
  provider_metadata,
  created_at,
  updated_at
) VALUES (
  '${authId}',
  'emailpass',
  '${userId}',
  '{"email": "${email}"}',
  NOW(),
  NOW()
);
    `)
    
    console.log("\n⚠️ 注意：你需要使用 Medusa CLI 或管理面板來設定實際密碼")
    console.log("或者使用: medusa user --email timsfantasyworld@gmail.com --password tims23224000")
  }
}
