import { ECPayCrypto } from './src/utils/ecpay-crypto'

// ECPay 測試金鑰
const testKey = "pwFHCqoQZGmho4w6"  // 從 .env 中的 ECPAY_HASH_KEY
const testIV = "EkRm7iFT261dpevs"   // 從 .env 中的 ECPAY_HASH_IV

// 測試資料
const testData = {
  TempLogisticsID: "0",
  GoodsAmount: 500,
  IsCollection: "N",
  GoodsName: "測試商品",
  SenderName: "王小明",
  SenderZipCode: "100",
  SenderAddress: "台北市中正區重慶南路一段122號",
  Remark: "",
  ServerReplyURL: "http://localhost:9000/store/ecpay/logistics-callback",
  ClientReplyURL: "http://localhost:8000/api/ecpay/logistics/callback",
  Temperature: "0001",
  Specification: "0001",
  ScheduledPickupTime: "4",
  ReceiverAddress: "",
  ReceiverCellPhone: "",
  ReceiverPhone: "",
  ReceiverName: "",
  EnableSelectDeliveryTime: "N",
  EshopMemberID: ""
}

console.log('🧪 ECPay 加密解密測試')
console.log('========================')

try {
  // 測試加密
  console.log('1. 測試資料:', testData)
  
  const dataString = JSON.stringify(testData)
  console.log('2. JSON 字串長度:', dataString.length)
  
  const encrypted = ECPayCrypto.encrypt(dataString, testKey, testIV)
  console.log('3. 加密結果:', encrypted.substring(0, 50) + '...')
  
  // 測試解密
  const decrypted = ECPayCrypto.decrypt(encrypted, testKey, testIV)
  console.log('4. 解密結果長度:', decrypted.length)
  
  const parsedData = JSON.parse(decrypted)
  console.log('5. 解密後的資料:', parsedData)
  
  // 驗證資料一致性
  const isMatch = JSON.stringify(parsedData) === JSON.stringify(testData)
  console.log('6. 資料一致性檢查:', isMatch ? '✅ 通過' : '❌ 失敗')
  
  if (isMatch) {
    console.log('\n🎉 加密解密測試成功！')
  } else {
    console.log('\n❌ 加密解密測試失敗！')
  }
  
} catch (error) {
  console.error('❌ 測試過程發生錯誤:', error)
}

// 測試時間戳
console.log('\n⏰ 時間戳測試')
console.log('========================')
const timestamp = ECPayCrypto.generateTimestamp()
console.log('生成時間戳:', timestamp)
console.log('時間戳有效性:', ECPayCrypto.isTimestampValid(timestamp) ? '✅ 有效' : '❌ 無效')

// 測試過期時間戳
const oldTimestamp = (parseInt(timestamp) - 400).toString() // 6分40秒前
console.log('過期時間戳:', oldTimestamp)
console.log('過期時間戳有效性:', ECPayCrypto.isTimestampValid(oldTimestamp) ? '✅ 有效' : '❌ 無效')
