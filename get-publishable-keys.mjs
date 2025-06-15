// get-publishable-keys.mjs
// 此腳本用於獲取環境變數中可能存儲的發佈 API 金鑰

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 檢查可能的環境變數文件
const envFiles = [
  '.env',
  '.env.local',
  '.env.development',
  '.env.production',
  'frontend/.env',
  'frontend/.env.local',
  'backend/.env',
  'backend/.env.local'
];

console.log('嘗試從環境變數檔案中查找發佈 API 金鑰...');

envFiles.forEach(file => {
  const filePath = path.resolve(__dirname, file);
  
  try {
    if (fs.existsSync(filePath)) {
      console.log(`找到環境變數檔案: ${file}`);
      const envConfig = dotenv.parse(fs.readFileSync(filePath));
      
      // 尋找可能的發佈 API 金鑰變數
      const possibleKeyVars = [
        'NEXT_PUBLIC_MEDUSA_API_KEY',
        'PUBLISHABLE_API_KEY',
        'NEXT_PUBLIC_PUBLISHABLE_API_KEY',
        'STORE_API_KEY',
        'NEXT_PUBLIC_STORE_API_KEY'
      ];
      
      possibleKeyVars.forEach(keyVar => {
        if (envConfig[keyVar]) {
          console.log(`找到可能的發佈 API 金鑰變數: ${keyVar} = ${envConfig[keyVar]}`);
        }
      });
      
      // 檢查所有環境變數，尋找可能包含 'api' 和 'key' 的變數
      Object.keys(envConfig).forEach(key => {
        if ((key.toLowerCase().includes('api') && key.toLowerCase().includes('key')) && 
            !possibleKeyVars.includes(key)) {
          console.log(`發現可能相關的 API 金鑰變數: ${key} = ${envConfig[key]}`);
        }
      });
    }
  } catch (error) {
    console.log(`讀取 ${file} 出錯: ${error.message}`);
  }
});

// 檢查前端代碼中使用的 API 金鑰
try {
  const frontendPaths = [
    'frontend/src',
    'test_frontend/src'
  ];
  
  console.log('\n嘗試從前端代碼中查找發佈 API 金鑰使用情況...');
  
  frontendPaths.forEach(folderPath => {
    const fullPath = path.resolve(__dirname, folderPath);
    if (fs.existsSync(fullPath)) {
      console.log(`搜尋目錄: ${folderPath}`);
      // 這裡實際上需要遍歷目錄並搜索文件，但為了簡單起見，我們只打印目錄存在的信息
    }
  });
} catch (error) {
  console.log(`搜尋前端代碼出錯: ${error.message}`);
}

console.log('\n請在前端代碼中搜索 "publishable-api-key" 或 "x-publishable-api-key" 以找到使用發佈 API 金鑰的地方。');
