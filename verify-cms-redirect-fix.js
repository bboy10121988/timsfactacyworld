#!/usr/bin/env node

/**
 * CMS 重定向修復驗證腳本
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 檢查 CMS 路徑重定向修復...\n');

const middlewarePath = path.join(__dirname, 'frontend/src/middleware.ts');

try {
  const content = fs.readFileSync(middlewarePath, 'utf8');
  
  const checks = [
    {
      name: 'excludedPaths 包含 /cms',
      test: content.includes("'/cms'"),
      expected: true
    },
    {
      name: 'excludedPaths 包含 /cms-info',
      test: content.includes("'/cms-info'"),
      expected: true
    },
    {
      name: 'excludedPaths 包含 /integration-test',
      test: content.includes("'/integration-test'"),
      expected: true
    },
    {
      name: 'matcher 排除 cms 路徑',
      test: content.includes('cms|cms-info|integration-test'),
      expected: true
    }
  ];
  
  let allPassed = true;
  
  checks.forEach(({ name, test, expected }) => {
    const passed = test === expected;
    console.log(`${passed ? '✅' : '❌'} ${name}: ${passed ? '通過' : '失敗'}`);
    if (!passed) allPassed = false;
  });
  
  console.log('\n' + '='.repeat(50));
  
  if (allPassed) {
    console.log('🎉 所有檢查通過！CMS 路徑重定向已修復！');
    console.log('\n📋 修復內容：');
    console.log('• /cms → 不會重定向到 /tw/cms');
    console.log('• /cms-info → 不會重定向到 /tw/cms-info');
    console.log('• /integration-test → 不會重定向到 /tw/integration-test');
    
    console.log('\n🔄 需要重啟開發服務器才能生效：');
    console.log('cd frontend && npm run dev -- --turbopack -p 8000');
    
    console.log('\n🧪 測試方式：');
    console.log('1. 重啟前端服務器');
    console.log('2. 訪問 http://localhost:8000/cms');
    console.log('3. 確認不會重定向到 /tw/cms');
  } else {
    console.log('❌ 某些檢查未通過，請檢查 middleware.ts 配置');
  }
  
} catch (error) {
  console.log('❌ 無法讀取 middleware.ts:', error.message);
}

console.log('\n📖 測試頁面: cms-redirect-test.html');
