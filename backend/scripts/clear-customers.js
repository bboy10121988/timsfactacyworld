const { Pool } = require('pg')
require('dotenv').config()

async function clearCustomers() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  })

  try {
    console.log('🗑️ 開始清空客戶資料...')

    // 開始事務
    await pool.query('BEGIN')

    // 清空客戶相關的表格，按照外鍵依賴順序
    const tables = [
      'cart', // 購物車
      'order', // 訂單
      'customer_group_customers', // 客戶群組關聯
      'customer', // 客戶主表
    ]

    let totalDeleted = 0

    for (const table of tables) {
      try {
        // 檢查表格是否存在
        const tableExists = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = $1
          )
        `, [table])

        if (tableExists.rows[0].exists) {
          // 獲取刪除前的記錄數（使用雙引號包圍表名）
          const countResult = await pool.query(`SELECT COUNT(*) FROM "${table}"`)
          const beforeCount = parseInt(countResult.rows[0].count)

          if (beforeCount > 0) {
            // 刪除記錄（使用雙引號包圍表名以處理 SQL 關鍵字）
            const result = await pool.query(`DELETE FROM "${table}"`)
            const deletedCount = result.rowCount || 0
            totalDeleted += deletedCount
            
            console.log(`✅ 已清空表格 "${table}": ${deletedCount} 筆記錄`)
          } else {
            console.log(`ℹ️  表格 "${table}" 已經是空的`)
          }
        } else {
          console.log(`⚠️  表格 "${table}" 不存在，跳過`)
        }
      } catch (error) {
        console.log(`⚠️  清空表格 "${table}" 時發生錯誤: ${error.message}`)
      }
    }

    // 重置序列（auto increment）
    const sequences = [
      'customer_id_seq',
      'cart_id_seq',
      'order_id_seq'
    ]

    for (const seq of sequences) {
      try {
        await pool.query(`SELECT setval('${seq}', 1, false)`)
        console.log(`🔄 已重置序列 "${seq}"`)
      } catch (error) {
        // 序列可能不存在，這是正常的
        console.log(`ℹ️  序列 "${seq}" 不存在或已重置`)
      }
    }

    // 提交事務
    await pool.query('COMMIT')
    
    console.log(`\n🎉 客戶資料清空完成！總共刪除了 ${totalDeleted} 筆記錄`)
    console.log('✨ 現在資料庫中沒有任何客戶資料，但其他資料（商品、類別等）保持完整')

  } catch (error) {
    // 回滾事務
    await pool.query('ROLLBACK')
    console.error('❌ 清空客戶資料時發生錯誤:', error.message)
    console.error('🔄 已回滾所有變更')
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// 執行清空操作
clearCustomers()
