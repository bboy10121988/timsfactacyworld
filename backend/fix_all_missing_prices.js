/**
 * 此腳本會檢查所有沒有價格的產品變體並為其添加預設價格
 * 執行方式：將此檔案儲存後，用 Node.js 執行:
 * node fix_all_missing_prices.js
 */

const { Client } = require('pg');
const path = require('path');
const fs = require('fs');

// 設定資料庫連線 (請根據您的環境修改)
const dbConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'medusa_db',
  password: 'postgres', // 請改為您的資料庫密碼
  port: 5432,
};

// 連線到資料庫
const client = new Client(dbConfig);

async function main() {
  try {
    console.log('正在連線到資料庫...');
    await client.connect();
    console.log('連線成功');

    // 1. 尋找所有沒有設定價格的產品變體
    const findVariantsQuery = `
      SELECT
        pv.id as variant_id,
        pv.title as variant_title,
        p.title as product_title,
        p.id as product_id
      FROM
        product_variant pv
      JOIN
        product p ON pv.product_id = p.id
      LEFT JOIN
        money_amount ma ON pv.id = ma.variant_id
      WHERE
        ma.id IS NULL
      ORDER BY
        p.created_at DESC;
    `;

    console.log('正在檢查沒有價格的產品變體...');
    const { rows: missingPriceVariants } = await client.query(findVariantsQuery);

    if (missingPriceVariants.length === 0) {
      console.log('找不到任何沒有價格的產品變體，所有變體都有正確的價格設定。');
      return;
    }

    console.log(`找到 ${missingPriceVariants.length} 個沒有價格的產品變體:`);
    missingPriceVariants.forEach((variant, index) => {
      console.log(`${index + 1}. ${variant.product_title} - ${variant.variant_title} (${variant.variant_id})`);
    });

    // 2. 獲取所有區域
    const { rows: regions } = await client.query(`
      SELECT id, name, currency_code FROM region ORDER BY name;
    `);

    if (regions.length === 0) {
      console.error('錯誤: 找不到任何區域設定');
      return;
    }

    console.log(`找到 ${regions.length} 個區域:`);
    regions.forEach((region, index) => {
      console.log(`${index + 1}. ${region.name} (${region.currency_code})`);
    });

    // 使用第一個區域作為默認區域
    const defaultRegion = regions[0];
    console.log(`將使用 ${defaultRegion.name} (${defaultRegion.id}) 作為默認區域`);

    // 3. 為每個沒有價格的變體添加預設價格
    console.log('開始添加預設價格...');
    
    const defaultPrice = 999; // 預設價格 (9.99)
    let fixedCount = 0;
    
    for (const variant of missingPriceVariants) {
      const priceId = `ma_${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      // 針對特定變體設定價格
      let price = defaultPrice;
      if (variant.variant_id === 'variant_01JY75WDZ2FCMC80CBMGCTT5RK') {
        price = 490;
      }
      
      try {
        await client.query(`
          INSERT INTO money_amount (
            id, currency_code, amount, variant_id, region_id, created_at, updated_at
          )
          VALUES (
            $1, $2, $3, $4, $5, NOW(), NOW()
          )
        `, [priceId, defaultRegion.currency_code, price, variant.variant_id, defaultRegion.id]);
        
        console.log(`✓ 已為 ${variant.product_title} - ${variant.variant_title} 添加價格: ${price/100} ${defaultRegion.currency_code}`);
        fixedCount++;
      } catch (error) {
        console.error(`✗ 為 ${variant.product_title} 添加價格時出錯:`, error.message);
      }
    }

    console.log(`\n完成! 已為 ${fixedCount}/${missingPriceVariants.length} 個產品變體添加價格`);

    // 4. 刷新產品變體的更新時間以確保緩存更新
    await client.query(`
      UPDATE product_variant
      SET updated_at = NOW()
      WHERE id IN (${missingPriceVariants.map(v => `'${v.variant_id}'`).join(',')});
    `);

    console.log('已更新產品變體時間戳記，緩存將被刷新');

  } catch (error) {
    console.error('執行腳本時發生錯誤:', error);
  } finally {
    await client.end();
    console.log('資料庫連線已關閉');
  }
}

main();
