// 測試前端是否接收到設計師圖片數據
const puppeteer = require('puppeteer');

async function checkFrontendData() {
  console.log('🔍 檢查前端接收到的設計師數據...');
  
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // 監聽控制台消息
    const consoleMessages = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('[ServiceCardsSection]')) {
        consoleMessages.push(text);
      }
    });
    
    await page.goto('http://localhost:8000/tw', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // 等待組件加載
    await page.waitForTimeout(3000);
    
    console.log('📊 前端調試訊息:');
    consoleMessages.forEach(msg => {
      console.log(msg);
    });
    
    await browser.close();
    
  } catch (error) {
    console.error('❌ 檢查失敗:', error.message);
  }
}

checkFrontendData();
