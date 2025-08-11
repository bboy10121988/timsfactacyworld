#!/usr/bin/env node

const https = require('http');

const testData = {
  name: "測試新會員",
  email: "newuser@test.com", 
  password: "test123456",
  phone: "0912345678"
};

console.log('🧪 開始測試會員系統...\n');

// 測試註冊
function testRegister() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(testData);
    
    const options = {
      hostname: 'localhost',
      port: 9000,
      path: '/store/affiliate/partners',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': 'sk_9fedcb4c350478cacf19a37ca3af9aec'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ 註冊響應:', result);
          resolve(result);
        } catch (e) {
          console.log('❌ 註冊解析錯誤:', e.message);
          console.log('原始響應:', data);
          reject(e);
        }
      });
    });

    req.on('error', (err) => {
      console.log('❌ 註冊請求錯誤:', err.message);
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

// 測試登入
function testLogin() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: testData.email,
      password: testData.password
    });
    
    const options = {
      hostname: 'localhost',
      port: 9000,
      path: '/store/affiliate/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': 'sk_9fedcb4c350478cacf19a37ca3af9aec'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ 登入響應:', result);
          resolve(result);
        } catch (e) {
          console.log('❌ 登入解析錯誤:', e.message);
          console.log('原始響應:', data);
          reject(e);
        }
      });
    });

    req.on('error', (err) => {
      console.log('❌ 登入請求錯誤:', err.message);
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

// 執行測試
async function runTest() {
  try {
    console.log('1️⃣ 測試註冊...');
    await testRegister();
    console.log('\n');
    
    console.log('2️⃣ 測試登入...');
    await testLogin();
    console.log('\n');
    
    console.log('🎉 測試完成！');
  } catch (error) {
    console.log('❌ 測試失敗:', error.message);
  }
}

runTest();
