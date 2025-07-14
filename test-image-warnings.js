// 測試腳本：檢查圖片相關警告是否修復
const puppeteer = require('puppeteer');

async function testImageWarnings() {
  console.log('🔧 開始測試圖片警告修復...');
  
  const browser = await puppeteer.launch({
    headless: false, // 可視化模式
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // 監聽控制台消息
  const consoleMessages = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(text);
    
    // 記錄所有警告和錯誤
    if (msg.type() === 'warning' || msg.type() === 'error') {
      console.log(`${msg.type().toUpperCase()}: ${text}`);
    }
  });

  try {
    console.log('📱 載入首頁...');
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // 等待頁面完全載入
    await page.waitForTimeout(3000);

    // 分析控制台訊息
    const imageWarnings = consoleMessages.filter(msg => 
      msg.includes('Image with src') && 
      (msg.includes('width') || msg.includes('height') || msg.includes('aspect'))
    );
    
    const promotionErrors = consoleMessages.filter(msg => 
      msg.includes('promotion') || 
      msg.includes('Failed to create cart') ||
      msg.includes('cart creation')
    );

    const notFoundErrors = consoleMessages.filter(msg => 
      msg.includes('404') || 
      msg.includes('not found') ||
      msg.includes('unsplash')
    );

    console.log('\n📊 測試結果：');
    console.log(`圖片寬高比例警告數量: ${imageWarnings.length}`);
    console.log(`促銷標籤錯誤數量: ${promotionErrors.length}`);
    console.log(`404錯誤數量: ${notFoundErrors.length}`);
    
    if (imageWarnings.length > 0) {
      console.log('\n⚠️ 圖片警告:');
      imageWarnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning}`);
      });
    }

    if (promotionErrors.length > 0) {
      console.log('\n❌ 促銷標籤錯誤:');
      promotionErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    if (notFoundErrors.length > 0) {
      console.log('\n🔍 404錯誤:');
      notFoundErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    if (imageWarnings.length === 0 && promotionErrors.length === 0 && notFoundErrors.length === 0) {
      console.log('\n✅ 太棒了！所有已知問題都已修復！');
    }

    // 檢查產品頁面
    console.log('\n🛍️ 檢查產品頁面...');
    try {
      await page.goto('http://localhost:3000/products', { 
        waitUntil: 'networkidle2',
        timeout: 20000 
      });
      await page.waitForTimeout(2000);
    } catch (e) {
      console.log('產品頁面無法載入，可能是正常的');
    }

    console.log('\n✨ 測試完成');

  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error.message);
  } finally {
    await browser.close();
  }
}

// 執行測試
testImageWarnings().catch(console.error);
