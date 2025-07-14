#!/usr/bin/env node

/**
 * Sanity CMS 整合驗證腳本
 * 檢查所有必要的文件和配置是否正確設置
 */

const fs = require('fs');
const path = require('path');

const checkList = [
  {
    name: 'Frontend package.json',
    path: 'frontend/package.json',
    check: (content) => {
      const pkg = JSON.parse(content);
      return pkg.dependencies && 
             pkg.dependencies['sanity'] && 
             pkg.dependencies['next-sanity'] &&
             pkg.dependencies['@sanity/vision'];
    }
  },
  {
    name: 'Sanity 簡化配置',
    path: 'frontend/sanity.config.simple.ts',
    check: (content) => content.includes('basePath: \'/cms\'')
  },
  {
    name: 'CMS 路由文件',
    path: 'frontend/src/app/cms/[[...tool]]/page.tsx',
    check: (content) => content.includes('NextStudio')
  },
  {
    name: 'Sanity Schemas',
    path: 'frontend/schemas/index.ts',
    check: (content) => content.includes('schemaTypes')
  },
  {
    name: '環境變數',
    path: 'frontend/.env.local',
    check: (content) => content.includes('SANITY_WEBHOOK_SECRET')
  },
  {
    name: 'Next.js 配置',
    path: 'frontend/next.config.js',
    check: (content) => content.includes('module.exports = nextConfig')
  }
];

console.log('🔍 Sanity CMS 整合驗證開始...\n');

let allPassed = true;

checkList.forEach(({ name, path: filePath, check }) => {
  const fullPath = path.join(__dirname, filePath);
  
  try {
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ ${name}: 文件不存在 (${filePath})`);
      allPassed = false;
      return;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    const passed = check(content);
    
    if (passed) {
      console.log(`✅ ${name}: 通過`);
    } else {
      console.log(`❌ ${name}: 配置不正確`);
      allPassed = false;
    }
  } catch (error) {
    console.log(`❌ ${name}: 檢查失敗 - ${error.message}`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 所有檢查通過！Sanity CMS 整合成功！');
  console.log('\n📋 可用功能：');
  console.log('• 前端網站: http://localhost:8000');
  console.log('• CMS Studio: http://localhost:8000/cms');
  console.log('• 整合測試: http://localhost:8000/integration-test');
  console.log('• 系統資訊: http://localhost:8000/cms-info');
  
  console.log('\n🚀 啟動指令：');
  console.log('npm run dev:integrated  # 啟動前端+後端');
  
} else {
  console.log('❌ 某些檢查未通過，請檢查上述問題');
}

console.log('\n📖 查看完整文檔: CMS-整合完成指南.md');
