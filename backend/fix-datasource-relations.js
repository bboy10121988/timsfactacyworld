export default async function({ container }) {
    const dataSource = container.resolve("dataSource")
    
    console.log("=== 用 DataSource 清理無效的關聯 ===")
    try {
        const queryRunner = dataSource.createQueryRunner()
        
        // 檢查無效的關聯
        const invalidLinks = await queryRunner.query(`
            SELECT scsl.sales_channel_id, scsl.stock_location_id, 
                   sc.name as sc_name, sl.name as sl_name, sl.deleted_at
            FROM sales_channel_stock_location scsl
            LEFT JOIN sales_channel sc ON scsl.sales_channel_id = sc.id
            LEFT JOIN stock_location sl ON scsl.stock_location_id = sl.id
            WHERE sl.id IS NULL OR sl.deleted_at IS NOT NULL
        `)
        
        console.log("發現無效的關聯:")
        console.log(invalidLinks)
        
        if (invalidLinks.length > 0) {
            console.log("🔧 刪除無效的關聯...")
            const deleteResult = await queryRunner.query(`
                DELETE FROM sales_channel_stock_location
                WHERE stock_location_id NOT IN (
                    SELECT id FROM stock_location WHERE deleted_at IS NULL
                ) OR stock_location_id IS NULL
            `)
            console.log("刪除了", deleteResult.affectedRows || deleteResult.length || "未知數量", "個無效關聯")
        } else {
            console.log("✅ 沒有發現無效的關聯")
        }
        
        // 檢查清理後的狀態
        const validLinks = await queryRunner.query(`
            SELECT scsl.sales_channel_id, scsl.stock_location_id,
                   sc.name as sc_name, sl.name as sl_name
            FROM sales_channel_stock_location scsl
            JOIN sales_channel sc ON scsl.sales_channel_id = sc.id
            JOIN stock_location sl ON scsl.stock_location_id = sl.id
            WHERE sl.deleted_at IS NULL
        `)
        console.log("\n剩餘的有效關聯:")
        console.log(validLinks)
        
        await queryRunner.release()
        
    } catch (err) {
        console.error("錯誤:", err.message)
        console.error("Stack:", err.stack)
    }
}
