const FRONTEND_URL = 'http://localhost:8000'

// 模擬用戶操作測試各個介面功能
async function testAffiliateInterface() {
  console.log('🖥️ 測試夥伴會員管理介面...\n')
  
  const pages = [
    '/tw/affiliate',           // 主頁面 (登入/註冊)
    '/tw/affiliate/settings',  // 設定頁面
    '/tw/affiliate/tools',     // 工具頁面  
    '/tw/affiliate/earnings'   // 收益頁面
  ]
  
  for (const page of pages) {
    console.log(`📄 檢查頁面: ${page}`)
    
    try {
      const response = await fetch(`${FRONTEND_URL}${page}`, {
        headers: {
          'User-Agent': 'Node.js Test Script'
        }
      })
      
      if (response.ok) {
        console.log(`  ✅ 頁面可訪問 (${response.status})`)
        
        // 檢查頁面內容
        const html = await response.text()
        const hasReactRoot = html.includes('__next') || html.includes('div id="root"')
        const hasTitle = html.includes('<title>')
        
        console.log(`  📋 React 根節點: ${hasReactRoot ? '✅' : '❌'}`)
        console.log(`  📋 頁面標題: ${hasTitle ? '✅' : '❌'}`)
        
        // 檢查特定功能存在性
        if (page.includes('settings')) {
          const hasProfileForm = html.includes('個人資料') || html.includes('Profile')
          const hasPasswordForm = html.includes('密碼') || html.includes('Password')
          const hasPaymentForm = html.includes('付款') || html.includes('Payment')
          console.log(`  🔧 個人資料表單: ${hasProfileForm ? '✅' : '❌'}`)
          console.log(`  🔧 密碼更新表單: ${hasPasswordForm ? '✅' : '❌'}`)
          console.log(`  🔧 付款資訊表單: ${hasPaymentForm ? '✅' : '❌'}`)
        }
        
        if (page.includes('tools')) {
          const hasReferralLink = html.includes('推薦連結') || html.includes('referral')
          const hasBanners = html.includes('橫幅') || html.includes('banner')
          console.log(`  🛠️ 推薦連結工具: ${hasReferralLink ? '✅' : '❌'}`)
          console.log(`  🛠️ 行銷素材: ${hasBanners ? '✅' : '❌'}`)
        }
        
        if (page.includes('earnings')) {
          const hasStats = html.includes('統計') || html.includes('stats')
          const hasHistory = html.includes('歷史') || html.includes('history')
          console.log(`  💰 收益統計: ${hasStats ? '✅' : '❌'}`)
          console.log(`  💰 收益歷史: ${hasHistory ? '✅' : '❌'}`)
        }
        
      } else {
        console.log(`  ❌ 頁面無法訪問 (${response.status})`)
      }
      
      console.log('')
      
    } catch (error) {
      console.log(`  🚨 頁面測試錯誤: ${error.message}`)
      console.log('')
    }
  }
}

// 檢查 API 端點是否正常回應
async function testAPIEndpoints() {
  console.log('🔗 測試 API 端點連接...\n')
  
  const endpoints = [
    { method: 'GET', path: '/store/affiliate/profile', name: '個人資料' },
    { method: 'PUT', path: '/store/affiliate/profile', name: '更新資料' },
    { method: 'PUT', path: '/store/affiliate/password', name: '更新密碼' },
    { method: 'PUT', path: '/store/affiliate/payment', name: '付款資訊' }
  ]
  
  const BACKEND_URL = 'http://localhost:9000'
  
  for (const endpoint of endpoints) {
    console.log(`🎯 測試 ${endpoint.name}: ${endpoint.method} ${endpoint.path}`)
    
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': 'pk_c515040dd6eb6cb48cbd1bcb052035f8a1c76bc229245392f0e2692b297070af'
        },
        body: endpoint.method !== 'GET' ? JSON.stringify({}) : undefined
      })
      
      console.log(`  📡 回應狀態: ${response.status}`)
      
      if (response.status === 401) {
        console.log(`  🔐 需要驗證 (正常)`)
      } else if (response.status === 400) {
        console.log(`  📋 參數錯誤 (正常，因為測試數據不完整)`)  
      } else if (response.ok) {
        console.log(`  ✅ API 正常回應`)
      } else {
        console.log(`  ⚠️ 非預期狀態碼`)
      }
      
    } catch (error) {
      console.log(`  🚨 API 連接錯誤: ${error.message}`)
    }
    
    console.log('')
  }
}

// 檢查關鍵功能文件是否存在
async function checkCriticalFiles() {
  console.log('📁 檢查關鍵文件完整性...\n')
  
  const fs = require('fs')
  const path = require('path')
  
  const criticalFiles = [
    'frontend/src/app/[countryCode]/(main)/affiliate/page.tsx',
    'frontend/src/app/[countryCode]/(main)/affiliate/affiliate-page-client.tsx',
    'frontend/src/app/[countryCode]/(main)/affiliate/settings/settings-page-client.tsx',
    'frontend/src/app/[countryCode]/(main)/affiliate/tools/tools-page-client.tsx',
    'frontend/src/app/[countryCode]/(main)/affiliate/earnings/earnings-page-client.tsx',
    'frontend/src/lib/affiliate-api.ts',
    'backend/src/api/store/affiliate/profile/route.ts',
    'backend/src/api/store/affiliate/password/route.ts',
    'backend/src/api/store/affiliate/payment/route.ts'
  ]
  
  for (const file of criticalFiles) {
    const fullPath = path.join(__dirname, file)
    const exists = fs.existsSync(fullPath)
    
    console.log(`${exists ? '✅' : '❌'} ${file}`)
    
    if (exists) {
      const stats = fs.statSync(fullPath)
      const sizeMB = (stats.size / 1024).toFixed(1)
      console.log(`  📏 大小: ${sizeMB} KB`)
    }
  }
}

async function main() {
  console.log('=== 🔍 夥伴會員管理介面全面檢查 ===\n')
  
  await checkCriticalFiles()
  console.log('\n' + '='.repeat(50) + '\n')
  
  await testAffiliateInterface()  
  console.log('='.repeat(50) + '\n')
  
  await testAPIEndpoints()
  console.log('='.repeat(50) + '\n')
  
  console.log('🎉 檢查完成！')
}

main().catch(console.error)
