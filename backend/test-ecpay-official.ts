import { ECPayCrypto } from './src/utils/ecpay-crypto'

// ECPay 官方測試資料
const testKey = "5294y06JbISpM5x9"  // 官方測試 HashKey
const testIV = "v77hoKGq4kWxNNIS"   // 官方測試 HashIV

// 官方測試資料
const testData = '{"Name":"Test","ID":"A123456789"}'

// 官方預期結果 (大寫編碼)
const expectedEncrypted = "0FKSa0j4InjlU0ewoWpzd9FmU9LVR/8z9Zmh8d+shjJ8fuvlmNxsxyOQfC2BB4VVPEA/MyAHNjzV6HcAGYXgCw=="

console.log('🧪 ECPay 官方加密測試')
console.log('========================')

try {
  console.log('1. 測試資料:', testData)
  console.log('2. 預期加密結果:', expectedEncrypted)
  
  // 測試我們的加密
  const ourEncrypted = ECPayCrypto.encrypt(testData, testKey, testIV)
  console.log('3. 我們的加密結果:', ourEncrypted)
  
  // 比較結果
  const isMatch = ourEncrypted === expectedEncrypted
  console.log('4. 加密結果比對:', isMatch ? '✅ 相符' : '❌ 不符')
  
  if (!isMatch) {
    console.log('\n🔍 詳細分析:')
    
    // 手動 URL 編碼測試
    const manualUrlEncoded = encodeURIComponent(testData)
    console.log('  - 手動 URL 編碼:', manualUrlEncoded)
    
    // 檢查 URL 編碼大小寫
    const upperCaseEncoded = manualUrlEncoded.replace(/%([a-f\d]{2})/gi, (match, hex) => {
      return '%' + hex.toUpperCase()
    })
    console.log('  - 大寫 URL 編碼:', upperCaseEncoded)
    
    // 期望的 URL 編碼 (從官方文檔)
    const expectedUrlEncoded = "%7B%22Name%22%3A%22Test%22%2C%22ID%22%3A%22A123456789%22%7D"
    console.log('  - 官方 URL 編碼:', expectedUrlEncoded)
    console.log('  - URL 編碼比對:', upperCaseEncoded === expectedUrlEncoded ? '✅ 相符' : '❌ 不符')
  }
  
  // 測試解密
  console.log('\n🔓 解密測試:')
  const decrypted = ECPayCrypto.decrypt(expectedEncrypted, testKey, testIV)
  console.log('5. 解密結果:', decrypted)
  console.log('6. 解密比對:', decrypted === testData ? '✅ 相符' : '❌ 不符')
  
} catch (error) {
  console.error('❌ 測試過程發生錯誤:', error)
}

console.log('\n🚚 物流 Data 加密測試')
console.log('========================')

// 使用實際的 ECPay 金鑰測試物流資料
const realKey = "pwFHCqoQZGmho4w6"
const realIV = "EkRm7iFT261dpevs"

const logisticsData = {
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

try {
  const logisticsDataString = JSON.stringify(logisticsData)
  console.log('1. 物流資料長度:', logisticsDataString.length)
  
  const encryptedLogistics = ECPayCrypto.encrypt(logisticsDataString, realKey, realIV)
  console.log('2. 物流資料加密成功，長度:', encryptedLogistics.length)
  
  const decryptedLogistics = ECPayCrypto.decrypt(encryptedLogistics, realKey, realIV)
  console.log('3. 物流資料解密成功，長度:', decryptedLogistics.length)
  
  const parsedLogistics = JSON.parse(decryptedLogistics)
  console.log('4. 物流資料解析成功')
  
  const isLogisticsMatch = JSON.stringify(parsedLogistics) === JSON.stringify(logisticsData)
  console.log('5. 物流資料完整性:', isLogisticsMatch ? '✅ 完整' : '❌ 損壞')
  
} catch (error) {
  console.error('❌ 物流資料測試錯誤:', error)
}
