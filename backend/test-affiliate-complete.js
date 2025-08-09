#!/usr/bin/env node

/**
 * 完整測試聯盟行銷 API 系統
 * 使用 curl 指令測試所有端點
 */

const { exec } = require('child_process')
const util = require('util')
const execAsync = util.promisify(exec)

const BASE_URL = 'http://localhost:9000'
let testResults = []
let currentPartnerToken = null
let currentPartnerId = null

// 測試資料
const testPartnerData = {
  name: '測試夥伴',
  email: `test${Date.now()}@example.com`,
  phone: '0912345678',
  website: 'https://test-partner.com',
  password: 'test123456'
}

function log(message, type = 'INFO') {
  const timestamp = new Date().toLocaleTimeString()
  const colors = {
    INFO: '\x1b[36m',    // Cyan
    SUCCESS: '\x1b[32m', // Green  
    ERROR: '\x1b[31m',   // Red
    WARN: '\x1b[33m'     // Yellow
  }
  const reset = '\x1b[0m'
  console.log(`${colors[type]}[${timestamp}] ${type}: ${message}${reset}`)
}

async function runCurl(method, endpoint, data = null, headers = {}) {
  let curlCommand = `curl -s -X ${method} "${BASE_URL}${endpoint}"`
  
  // 添加預設標頭
  curlCommand += ` -H "Content-Type: application/json"`
  
  // 添加自定義標頭
  for (const [key, value] of Object.entries(headers)) {
    curlCommand += ` -H "${key}: ${value}"`
  }
  
  // 添加資料
  if (data) {
    curlCommand += ` -d '${JSON.stringify(data)}'`
  }
  
  try {
    log(`執行: ${curlCommand}`)
    const { stdout, stderr } = await execAsync(curlCommand)
    
    if (stderr) {
      log(`Curl 錯誤: ${stderr}`, 'ERROR')
    }
    
    let result
    try {
      result = JSON.parse(stdout)
    } catch (parseError) {
      log(`JSON 解析錯誤: ${parseError.message}`, 'ERROR')
      log(`原始回應: ${stdout}`, 'ERROR')
      result = { error: 'JSON parse failed', raw: stdout }
    }
    
    log(`回應: ${JSON.stringify(result, null, 2)}`)
    return result
    
  } catch (error) {
    log(`執行錯誤: ${error.message}`, 'ERROR')
    return { error: error.message }
  }
}

async function testAPI(testName, method, endpoint, data = null, headers = {}, expectedSuccess = true) {
  log(`\n🧪 測試: ${testName}`)
  log(`方法: ${method} ${endpoint}`)
  
  const result = await runCurl(method, endpoint, data, headers)
  
  const success = expectedSuccess ? result.success === true : result.success === false
  const status = success ? 'PASS' : 'FAIL'
  const logType = success ? 'SUCCESS' : 'ERROR'
  
  log(`結果: ${status}`, logType)
  
  testResults.push({
    name: testName,
    method,
    endpoint,
    success,
    result
  })
  
  return result
}

async function runAllTests() {
  log('🚀 開始完整的聯盟行銷系統測試...\n', 'INFO')
  
  try {
    // ========== 前端 Store API 測試 ==========
    log('📱 前端 Store API 測試', 'INFO')
    
    // 1. 檢查 email 是否存在（應該不存在）
    await testAPI(
      '檢查 email 是否存在',
      'GET',
      `/store/affiliate/partners?email=${testPartnerData.email}`
    )
    
    // 2. 註冊新夥伴
    const registerResult = await testAPI(
      '註冊聯盟夥伴',
      'POST',
      '/store/affiliate/partners',
      testPartnerData
    )
    
    if (registerResult.partner) {
      currentPartnerId = registerResult.partner.id
      log(`註冊成功，夥伴 ID: ${currentPartnerId}`, 'SUCCESS')
    }
    
    // 3. 檢查 email 是否存在（現在應該存在）
    await testAPI(
      '檢查 email 存在性（已註冊）',
      'GET',
      `/store/affiliate/partners?email=${testPartnerData.email}`
    )
    
    // 4. 嘗試用相同 email 重複註冊（應該失敗）
    await testAPI(
      '重複註冊測試',
      'POST',
      '/store/affiliate/partners',
      testPartnerData,
      {},
      false // 預期失敗
    )
    
    // 5. 嘗試登入（應該失敗，因為尚未審核）
    await testAPI(
      '未審核狀態登入測試',
      'POST',
      '/store/affiliate/login',
      {
        email: testPartnerData.email,
        password: testPartnerData.password
      },
      {},
      false // 預期失敗
    )
    
    // ========== 管理員 Admin API 測試 ==========
    log('\n👨‍💼 管理員 Admin API 測試', 'INFO')
    
    // 6. 取得所有夥伴列表
    await testAPI(
      '取得夥伴列表',
      'GET',
      '/admin/affiliate/partners'
    )
    
    // 7. 取得待審核的夥伴
    await testAPI(
      '取得待審核夥伴',
      'GET',
      '/admin/affiliate/partners?status=pending'
    )
    
    // 8. 審核夥伴（核准）
    if (currentPartnerId) {
      await testAPI(
        '審核夥伴（核准）',
        'POST',
        `/admin/affiliate/partners/${currentPartnerId}/approve`,
        {
          status: 'approved',
          reason: '測試核准'
        }
      )
    }
    
    // 9. 取得統計資料
    await testAPI(
      '取得管理員統計資料',
      'GET',
      '/admin/affiliate/stats'
    )
    
    // ========== 審核後的前端功能測試 ==========
    log('\n✅ 審核後的前端功能測試', 'INFO')
    
    // 10. 夥伴登入（現在應該成功）
    const loginResult = await testAPI(
      '夥伴登入',
      'POST',
      '/store/affiliate/login',
      {
        email: testPartnerData.email,
        password: testPartnerData.password
      }
    )
    
    if (loginResult.token) {
      currentPartnerToken = loginResult.token
      log(`登入成功，取得 Token: ${currentPartnerToken.substring(0, 20)}...`, 'SUCCESS')
    }
    
    // 11. 記錄點擊追蹤
    await testAPI(
      '記錄點擊追蹤',
      'POST',
      '/store/affiliate/track',
      {
        partnerId: currentPartnerId,
        productId: 'test-product-123',
        url: 'https://example.com/product/123',
        userAgent: 'Test User Agent',
        referrer: 'https://google.com'
      }
    )
    
    // 12. 記錄多次點擊（用於測試統計）
    for (let i = 0; i < 3; i++) {
      await testAPI(
        `記錄點擊追蹤 #${i + 2}`,
        'POST',
        '/store/affiliate/track',
        {
          partnerId: currentPartnerId,
          productId: `test-product-${i + 2}`,
          url: `https://example.com/product/${i + 2}`,
          userAgent: 'Test User Agent',
          referrer: 'https://google.com'
        }
      )
    }
    
    // 13. 記錄轉換
    const conversionResult = await testAPI(
      '記錄轉換',
      'POST',
      '/store/affiliate/conversion',
      {
        partnerId: currentPartnerId,
        orderId: 'test-order-123',
        productId: 'test-product-123',
        orderValue: 1000,
        commissionRate: 0.05
      }
    )
    
    let conversionId = null
    if (conversionResult.conversion) {
      conversionId = conversionResult.conversion.id
    }
    
    // 14. 記錄更多轉換（用於測試）
    for (let i = 0; i < 2; i++) {
      await testAPI(
        `記錄轉換 #${i + 2}`,
        'POST',
        '/store/affiliate/conversion',
        {
          partnerId: currentPartnerId,
          orderId: `test-order-${i + 2}`,
          productId: `test-product-${i + 2}`,
          orderValue: (i + 1) * 500,
          commissionRate: 0.05
        }
      )
    }
    
    // 15. 取得夥伴統計資料（需要認證）
    if (currentPartnerToken && currentPartnerId) {
      await testAPI(
        '取得夥伴統計資料（已認證）',
        'GET',
        `/store/affiliate/partners/${currentPartnerId}/stats`,
        null,
        {
          'Authorization': `Bearer ${currentPartnerToken}`
        }
      )
    }
    
    // 16. 嘗試取得其他夥伴的統計資料（應該失敗）
    if (currentPartnerToken) {
      await testAPI(
        '取得其他夥伴統計資料（權限測試）',
        'GET',
        '/store/affiliate/partners/fake-id/stats',
        null,
        {
          'Authorization': `Bearer ${currentPartnerToken}`
        },
        false // 預期失敗
      )
    }
    
    // ========== 佣金管理測試 ==========
    log('\n💰 佣金管理測試', 'INFO')
    
    // 17. 取得佣金列表
    await testAPI(
      '取得佣金列表',
      'GET',
      '/admin/affiliate/commissions'
    )
    
    // 18. 取得待審核佣金
    await testAPI(
      '取得待審核佣金',
      'GET',
      '/admin/affiliate/commissions?status=pending'
    )
    
    // 19. 更新佣金狀態（核准）
    if (conversionId) {
      await testAPI(
        '核准佣金',
        'POST',
        `/admin/affiliate/commissions/${conversionId}/status`,
        {
          status: 'approved',
          reason: '測試核准佣金'
        }
      )
    }
    
    // 20. 標記佣金為已支付
    if (conversionId) {
      await testAPI(
        '標記佣金已支付',
        'POST',
        `/admin/affiliate/commissions/${conversionId}/status`,
        {
          status: 'paid',
          reason: '測試支付'
        }
      )
    }
    
    // ========== 錯誤處理測試 ==========
    log('\n❌ 錯誤處理測試', 'INFO')
    
    // 21. 無效登入
    await testAPI(
      '無效密碼登入',
      'POST',
      '/store/affiliate/login',
      {
        email: testPartnerData.email,
        password: 'wrong-password'
      },
      {},
      false
    )
    
    // 22. 不存在的 email 登入
    await testAPI(
      '不存在的 email 登入',
      'POST',
      '/store/affiliate/login',
      {
        email: 'nonexistent@example.com',
        password: 'password'
      },
      {},
      false
    )
    
    // 23. 無效的 token
    await testAPI(
      '無效 token 測試',
      'GET',
      `/store/affiliate/partners/${currentPartnerId}/stats`,
      null,
      {
        'Authorization': 'Bearer invalid-token'
      },
      false
    )
    
    // 24. 缺少必要參數
    await testAPI(
      '缺少必要參數測試',
      'POST',
      '/store/affiliate/partners',
      {
        name: '測試'
        // 缺少 email 和 password
      },
      {},
      false
    )
    
    // ========== 最終統計 ==========
    log('\n📊 最終統計資料測試', 'INFO')
    
    // 25. 最終統計資料
    await testAPI(
      '最終管理員統計',
      'GET',
      '/admin/affiliate/stats'
    )
    
    await testAPI(
      '最終夥伴統計',
      'GET',
      `/store/affiliate/partners/${currentPartnerId}/stats`,
      null,
      {
        'Authorization': `Bearer ${currentPartnerToken}`
      }
    )
    
  } catch (error) {
    log(`測試過程中發生錯誤: ${error.message}`, 'ERROR')
  }
  
  // 顯示測試結果摘要
  showTestSummary()
}

function showTestSummary() {
  log('\n📋 測試結果摘要', 'INFO')
  log('=' .repeat(60), 'INFO')
  
  const passed = testResults.filter(t => t.success).length
  const failed = testResults.filter(t => !t.success).length
  const total = testResults.length
  
  log(`總測試數: ${total}`, 'INFO')
  log(`通過: ${passed}`, 'SUCCESS')
  log(`失敗: ${failed}`, failed > 0 ? 'ERROR' : 'SUCCESS')
  log(`通過率: ${((passed / total) * 100).toFixed(1)}%`, 'INFO')
  
  if (failed > 0) {
    log('\n❌ 失敗的測試:', 'ERROR')
    testResults.filter(t => !t.success).forEach(test => {
      log(`  - ${test.name} (${test.method} ${test.endpoint})`, 'ERROR')
    })
  }
  
  log('\n✅ 通過的測試:', 'SUCCESS')
  testResults.filter(t => t.success).forEach(test => {
    log(`  - ${test.name}`, 'SUCCESS')
  })
  
  log('\n' + '='.repeat(60), 'INFO')
  log('測試完成！', 'SUCCESS')
  
  if (currentPartnerId) {
    log(`\n📌 測試夥伴 ID: ${currentPartnerId}`, 'INFO')
  }
  if (currentPartnerToken) {
    log(`📌 測試夥伴 Token: ${currentPartnerToken.substring(0, 30)}...`, 'INFO')
  }
}

// 檢查 Medusa 伺服器是否運行
async function checkServer() {
  try {
    const result = await runCurl('GET', '/health')
    log('伺服器健康檢查通過', 'SUCCESS')
    return true
  } catch (error) {
    log('無法連接到 Medusa 伺服器，請確認伺服器正在運行在 http://localhost:9000', 'ERROR')
    return false
  }
}

// 主要執行
async function main() {
  log('聯盟行銷系統完整測試開始', 'INFO')
  
  const serverRunning = await checkServer()
  if (!serverRunning) {
    log('請先啟動 Medusa 伺服器: npm run dev', 'ERROR')
    process.exit(1)
  }
  
  await runAllTests()
}

// 如果直接執行此腳本
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { runAllTests, testAPI }
