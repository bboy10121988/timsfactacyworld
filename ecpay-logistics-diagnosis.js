#!/usr/bin/env node

/**
 * ECPay 物流 API 診斷腳本
 * 用於診斷 RqHeader 錯誤問題
 */

const crypto = require('crypto');

// 環境變數模擬 (使用備份檔案中的測試環境設定)
const ECPAY_MERCHANT_ID = "3002607";
const ECPAY_HASH_KEY = "pwFHCqoQZGmho4w6";
const ECPAY_HASH_IV = "EkRm7iFT261dpevs";

console.log('🔍 ECPay 物流 API 診斷開始...\n');

// 1. 檢查環境變數
function checkEnvironmentVariables() {
  console.log('=== 1. 環境變數檢查 ===');
  console.log('ECPAY_MERCHANT_ID:', ECPAY_MERCHANT_ID);
  console.log('ECPAY_HASH_KEY:', ECPAY_HASH_KEY ? '✅ 已設定' : '❌ 未設定');
  console.log('ECPAY_HASH_IV:', ECPAY_HASH_IV ? '✅ 已設定' : '❌ 未設定');
  console.log('Key 長度:', ECPAY_HASH_KEY?.length, '(應為16)');
  console.log('IV 長度:', ECPAY_HASH_IV?.length, '(應為16)');
  console.log('');
}

// 2. 時間戳診斷
function diagnoseLongTimestamp() {
  console.log('=== 2. 時間戳診斷 ===');
  
  const now = Date.now();
  const unixTimestamp = Math.floor(now / 1000);
  const dateObj = new Date(now);
  
  console.log('JavaScript Date.now():', now);
  console.log('Unix 時間戳:', unixTimestamp);
  console.log('對應日期 (台灣時間):', dateObj.toLocaleString('zh-TW', {timeZone: 'Asia/Taipei'}));
  console.log('時間戳字串長度:', unixTimestamp.toString().length);
  
  // 檢查錯誤時間戳
  const errorTimestamp = "1753084340";
  const errorDate = new Date(parseInt(errorTimestamp) * 1000);
  console.log('\n❌ 錯誤時間戳分析:');
  console.log('錯誤時間戳:', errorTimestamp);
  console.log('對應日期:', errorDate.toLocaleString('zh-TW', {timeZone: 'Asia/Taipei'}));
  console.log('與當前差異（秒）:', Math.abs(unixTimestamp - parseInt(errorTimestamp)));
  console.log('是否在允許範圍內 (300秒):', Math.abs(unixTimestamp - parseInt(errorTimestamp)) <= 300);
  console.log('');
}

// 3. AES 加密診斷
function diagnoseAESEncryption() {
  console.log('=== 3. AES 加密診斷 ===');
  
  const testData = "TempLogisticsID=0&GoodsAmount=100&IsCollection=N&GoodsName=測試商品";
  console.log('原始測試資料:', testData);
  
  try {
    // URL Encode
    const urlEncoded = encodeURIComponent(testData);
    console.log('URL 編碼後:', urlEncoded.substring(0, 100) + '...');
    
    // 確保 key 和 iv 長度
    const keyBuffer = Buffer.from(ECPAY_HASH_KEY.padEnd(16, '0').substring(0, 16));
    const ivBuffer = Buffer.from(ECPAY_HASH_IV.padEnd(16, '0').substring(0, 16));
    
    console.log('Key Buffer:', keyBuffer.toString('hex'));
    console.log('IV Buffer:', ivBuffer.toString('hex'));
    
    // AES 加密
    const cipher = crypto.createCipheriv('aes-128-cbc', keyBuffer, ivBuffer);
    let encrypted = cipher.update(urlEncoded, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    console.log('加密成功:', '✅');
    console.log('加密結果長度:', encrypted.length);
    console.log('加密結果:', encrypted.substring(0, 50) + '...');
    
    return encrypted;
  } catch (error) {
    console.log('加密失敗:', '❌', error.message);
    return null;
  }
  console.log('');
}

// 4. RqHeader 格式診斷
function diagnoseRqHeaderFormat() {
  console.log('=== 4. RqHeader 格式診斷 ===');
  
  const timestamp = Math.floor(Date.now() / 1000).toString();
  
  // 測試多種 RqHeader 格式
  const formats = [
    { name: '物件格式', value: { Timestamp: timestamp } },
    { name: 'JSON 字串格式', value: JSON.stringify({ Timestamp: timestamp }) },
    { name: '直接字串格式', value: `{"Timestamp":"${timestamp}"}` }
  ];
  
  formats.forEach((format, index) => {
    console.log(`\n格式 ${index + 1}: ${format.name}`);
    console.log('值:', format.value);
    console.log('類型:', typeof format.value);
    
    if (typeof format.value === 'string') {
      try {
        const parsed = JSON.parse(format.value);
        console.log('可解析:', '✅', parsed);
      } catch (e) {
        console.log('解析失敗:', '❌', e.message);
      }
    }
  });
  console.log('');
}

// 5. 完整請求參數模擬
function simulateFullRequest() {
  console.log('=== 5. 完整請求參數模擬 ===');
  
  const encryptedData = diagnoseAESEncryption();
  if (!encryptedData) {
    console.log('❌ 無法進行完整模擬，加密失敗');
    return;
  }
  
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const rqHeader = { Timestamp: timestamp };
  
  const requestParams = {
    MerchantID: ECPAY_MERCHANT_ID,
    RqHeader: JSON.stringify(rqHeader),
    Data: encryptedData
  };
  
  console.log('📦 模擬的完整請求參數:');
  console.log('MerchantID:', requestParams.MerchantID);
  console.log('RqHeader:', requestParams.RqHeader);
  console.log('Data (前50字元):', requestParams.Data.substring(0, 50) + '...');
  
  // 驗證各參數
  console.log('\n✅ 參數驗證:');
  console.log('- MerchantID 非空:', !!requestParams.MerchantID);
  console.log('- RqHeader 非空:', !!requestParams.RqHeader);
  console.log('- Data 非空:', !!requestParams.Data);
  console.log('- RqHeader 是字串:', typeof requestParams.RqHeader === 'string');
  console.log('- RqHeader 可解析:', (() => {
    try {
      JSON.parse(requestParams.RqHeader);
      return true;
    } catch {
      return false;
    }
  })());
  
  console.log('');
}

// 6. 可能的問題分析
function analyzePossibleIssues() {
  console.log('=== 6. 可能的問題分析 ===');
  
  console.log('🔍 RqHeader 為 null 的可能原因:');
  console.log('1. ❌ 表單提交時 RqHeader 欄位遺失');
  console.log('2. ❌ RqHeader 值為空字串或 undefined');
  console.log('3. ❌ JSON.stringify() 失敗');
  console.log('4. ❌ 前端表單編碼問題');
  console.log('5. ❌ 網路傳輸過程中資料遺失');
  
  console.log('\n🔧 建議的修復方案:');
  console.log('1. ✅ 加強參數驗證，確保 RqHeader 不為 null');
  console.log('2. ✅ 增加詳細的日誌記錄');
  console.log('3. ✅ 在 HTML 表單中使用明確的字串值');
  console.log('4. ✅ 加入前端 JavaScript 驗證');
  
  console.log('');
}

// 執行所有診斷
checkEnvironmentVariables();
diagnoseLongTimestamp();
diagnoseAESEncryption();
diagnoseRqHeaderFormat();
simulateFullRequest();
analyzePossibleIssues();

console.log('🎉 ECPay 物流 API 診斷完成！');
console.log('\n📋 總結建議:');
console.log('1. 檢查實際 API 調用時的環境變數設定');
console.log('2. 確認 HTML 表單中的 RqHeader 欄位值');
console.log('3. 驗證前端提交的資料格式');
console.log('4. 檢查網路環境和 SSL 憑證');
