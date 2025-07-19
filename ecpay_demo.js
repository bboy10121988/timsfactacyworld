// ECPay Node.js SDK Demo 測試程式
// 安裝指令：npm install ecpay_aio_nodejs

const ecpay_payment = require('ecpay_aio_nodejs');

// 取得台灣時區的 YYYY/MM/DD HH:mm:ss
function getTaiwanDateTimeString() {
  const now = new Date();
  // 轉為台灣時區
  now.setHours(now.getHours() + 8 - now.getTimezoneOffset() / 60);
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd} ${hh}:${min}:${ss}`;
}

// 請將下方參數改成你的 ngrok 與測試資料
let base_param = {
  MerchantID: '3002607',
  MerchantTradeNo: 'test' + Date.now(),
  MerchantTradeDate: getTaiwanDateTimeString(),
  PaymentType: 'aio',
  TotalAmount: '324',
  TradeDesc: '網站訂單付款',
  ItemName: '紅帽 Fantasy World 高支撐度髮泥 x 1',
  ReturnURL: 'https://5032eb5fd79c.ngrok-free.app/api/ecpay/return',
  ChoosePayment: 'ALL',
  EncryptType: 1,
  ClientBackURL: 'https://fe97888212f7.ngrok-free.app/order/thank-you'
};

let create = new ecpay_payment({
  OperationMode: 'Test', // 'Test' for 測試環境, 'Production' for 正式環境
  MercProfile: {
    MerchantID: '3002607',
    HashKey: 'pwFHCqoQZGmho4w6',
    HashIV: 'EkRm7iFT261dpevs'
  },
  IgnorePayment: [],
  IsProjectContractor: false
});

let html = create.payment_client.aio_check_out_all(base_param);

console.log('======= 請複製下方 HTML 到新檔案，瀏覽器打開測試 =======\n');
console.log(html); 