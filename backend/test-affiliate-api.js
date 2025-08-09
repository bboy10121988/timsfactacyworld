#!/usr/bin/env node

/**
 * 使用測試端點驗證聯盟行銷系統的完整功能
 */

const { exec } = require('child_process')
const util = require('util')
const execAsync = util.promisify(exec)

const BASE_URL = 'http://localhost:9000'
let testResults = []
let currentPartnerId = null
let currentPartnerToken = null

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

async function runCurl(method, endpoint, data = null) {
  let curlCommand = `curl -s -X ${method} "${BASE_URL}${endpoint}"`
  curlCommand += ` -H "Content-Type: application/json"`
  
  if (data) {
    curlCommand += ` -d '${JSON.stringify(data)}'`
  }
  
  try {
    log(`執行: ${curlCommand}`)
    const { stdout, stderr } = await execAsync(curlCommand)
    
    if (stderr) {
      log(`Curl 錯誤: ${stderr}`, 'WARN')
    }
    
    let result
    try {
      result = JSON.parse(stdout)
    } catch (parseError) {
      log(`JSON 解析錯誤: ${parseError.message}`, 'ERROR')
      result = { error: 'JSON parse failed', raw: stdout }
    }
    
    log(`回應: ${JSON.stringify(result, null, 2)}`)
    return result
    
  } catch (error) {
    log(`執行錯誤: ${error.message}`, 'ERROR')
    return { error: error.message }
  }
}

async function testAPI(testName, method, endpoint, data = null, expectedSuccess = true) {
  log(`\n🧪 測試: ${testName}`)
  
  const result = await runCurl(method, endpoint, data)
  const success = expectedSuccess ? result.success === true : result.success === false
  const status = success ? 'PASS' : 'FAIL'
  const logType = success ? 'SUCCESS' : 'ERROR'
  
  log(`結果: ${status}`, logType)
  
  testResults.push({
    name: testName,
    success,
    result
  })
  
  return result
}

async function runAPITests() {
  log('🚀 開始 API 端點測試...\n')
  
  // ========== 基礎健康檢查 ==========
  await testAPI('健康檢查', 'GET', '/test-affiliate?action=health')
  
  // ========== 夥伴管理測試 ==========
  log('\n👥 夥伴管理測試')
  
  const partnerData = {
    name: '測試夥伴API',
    email: `api-test${Date.now()}@example.com`,
    phone: '0912345678',
    website: 'https://api-test.com',
    password: 'password123'
  }
  
  // 創建夥伴
  const createResult = await testAPI('創建夥伴', 'POST', '/test-affiliate?action=create-partner', partnerData)
  if (createResult.success && createResult.partner) {
    currentPartnerId = createResult.partner.id
    log(`夥伴 ID: ${currentPartnerId}`, 'INFO')
  }
  
  // 嘗試登入（未審核，應該失敗）
  await testAPI('未審核夥伴登入', 'POST', '/test-affiliate?action=login', {
    email: partnerData.email,
    password: partnerData.password
  }, false)
  
  // 審核夥伴
  if (currentPartnerId) {
    await testAPI('審核夥伴', 'POST', '/test-affiliate?action=approve-partner', {
      partnerId: currentPartnerId,
      status: 'approved',
      reason: 'API 測試核准'
    })
  }
  
  // 審核後登入（應該成功）
  const loginResult = await testAPI('審核後登入', 'POST', '/test-affiliate?action=login', {
    email: partnerData.email,
    password: partnerData.password
  })
  
  if (loginResult.success && loginResult.token) {
    currentPartnerToken = loginResult.token
    log(`Token: ${currentPartnerToken.substring(0, 30)}...`, 'INFO')
  }
  
  // 取得夥伴列表
  await testAPI('取得夥伴列表', 'GET', '/test-affiliate?action=partners')
  
  // ========== 點擊和轉換測試 ==========
  log('\n👆 點擊和轉換測試')
  
  // 記錄點擊
  await testAPI('記錄點擊', 'POST', '/test-affiliate?action=track-click', {
    partnerId: currentPartnerId,
    productId: 'api-test-product-1',
    url: 'https://shop.com/product/1',
    userAgent: 'API Test Browser',
    referrer: 'https://api-test.com'
  })
  
  // 記錄更多點擊
  for (let i = 2; i <= 3; i++) {
    await testAPI(`記錄點擊 #${i}`, 'POST', '/test-affiliate?action=track-click', {
      partnerId: currentPartnerId,
      productId: `api-test-product-${i}`,
      url: `https://shop.com/product/${i}`,
      userAgent: 'API Test Browser',
      referrer: 'https://api-test.com'
    })
  }
  
  // 記錄轉換
  const conversionResult = await testAPI('記錄轉換', 'POST', '/test-affiliate?action=record-conversion', {
    partnerId: currentPartnerId,
    orderId: 'api-order-1',
    productId: 'api-test-product-1',
    orderValue: 1200,
    commissionRate: 0.05
  })
  
  let conversionId = null
  if (conversionResult.success && conversionResult.conversion) {
    conversionId = conversionResult.conversion.id
  }
  
  // 記錄更多轉換
  await testAPI('記錄轉換 #2', 'POST', '/test-affiliate?action=record-conversion', {
    partnerId: currentPartnerId,
    orderId: 'api-order-2',
    productId: 'api-test-product-2',
    orderValue: 800,
    commissionRate: 0.04
  })
  
  // ========== 統計資料測試 ==========
  log('\n📊 統計資料測試')
  
  // 取得夥伴統計
  if (currentPartnerId) {
    await testAPI('取得夥伴統計', 'POST', '/test-affiliate?action=partner-stats', {
      partnerIdForStats: currentPartnerId
    })
  }
  
  // 取得管理員統計
  await testAPI('取得管理員統計', 'GET', '/test-affiliate?action=stats')
  
  // ========== 佣金管理測試 ==========
  log('\n💰 佣金管理測試')
  
  // 取得佣金列表
  await testAPI('取得佣金列表', 'GET', '/test-affiliate?action=commissions')
  
  // 更新佣金狀態
  if (conversionId) {
    await testAPI('核准佣金', 'POST', '/test-affiliate?action=update-commission', {
      conversionId: conversionId,
      newStatus: 'approved',
      updateReason: 'API 測試核准'
    })
    
    await testAPI('標記佣金已支付', 'POST', '/test-affiliate?action=update-commission', {
      conversionId: conversionId,
      newStatus: 'paid',
      updateReason: 'API 測試支付'
    })
  }
  
  // ========== 錯誤處理測試 ==========
  log('\n❌ 錯誤處理測試')
  
  // 無效密碼
  await testAPI('無效密碼登入', 'POST', '/test-affiliate?action=login', {
    email: partnerData.email,
    password: 'wrong-password'
  }, false)
  
  // 不存在的夥伴
  await testAPI('不存在的夥伴統計', 'POST', '/test-affiliate?action=partner-stats', {
    partnerIdForStats: 'non-existent-id'
  }, false)
  
  // ========== 最終統計 ==========
  log('\n📊 最終測試統計')
  
  await testAPI('最終管理員統計', 'GET', '/test-affiliate?action=stats')
  
  showTestSummary()
}

function showTestSummary() {
  log('\n📋 API 測試結果摘要')
  log('=' .repeat(60))
  
  const passed = testResults.filter(t => t.success).length
  const failed = testResults.filter(t => !t.success).length
  const total = testResults.length
  
  log(`總測試數: ${total}`)
  log(`通過: ${passed}`, 'SUCCESS')
  log(`失敗: ${failed}`, failed > 0 ? 'ERROR' : 'SUCCESS')
  log(`通過率: ${((passed / total) * 100).toFixed(1)}%`)
  
  if (failed > 0) {
    log('\n❌ 失敗的測試:', 'ERROR')
    testResults.filter(t => !t.success).forEach(test => {
      log(`  - ${test.name}`, 'ERROR')
    })
  }
  
  log('\n✅ 通過的測試:', 'SUCCESS')
  testResults.filter(t => t.success).forEach(test => {
    log(`  - ${test.name}`, 'SUCCESS')
  })
  
  log('\n' + '='.repeat(60))
  log('API 測試完成！', 'SUCCESS')
  
  // 提供測試總結資訊
  if (currentPartnerId) {
    log(`\n📌 測試夥伴 ID: ${currentPartnerId}`, 'INFO')
  }
  if (currentPartnerToken) {
    log(`📌 JWT Token: ${currentPartnerToken.substring(0, 50)}...`, 'INFO')
  }
}

async function main() {
  log('聯盟行銷系統 API 測試開始')
  
  // 檢查伺服器
  try {
    await runCurl('GET', '/health')
    log('伺服器連線正常', 'SUCCESS')
  } catch (error) {
    log('無法連接伺服器，請確認 Medusa 正在運行', 'ERROR')
    return
  }
  
  await runAPITests()
}

if (require.main === module) {
  main().catch(console.error)
}
