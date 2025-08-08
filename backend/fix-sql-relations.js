export default async function({ container }) {
    const manager = container.resolve("manager")
    
    console.log("=== 直接 SQL 檢查和清理無效的關聯 ===")
    try {
        // 檢查 sales_channel_stock_location 表
        const invalidLinks = await manager.query(`
            SELECT scsl.*, sc.name as sc_name, sl.name as sl_name
            FROM sales_channel_stock_location scsl
            LEFT JOIN sales_channel sc ON scsl.sales_channel_id = sc.id
            LEFT JOIN stock_location sl ON scsl.stock_location_id = sl.id
            WHERE sl.id IS NULL OR sl.deleted_at IS NOT NULL
        `)
        
        console.log("無效的 Sales Channel - Stock Location 關聯:")
        console.log(invalidLinks)
        
        if (invalidLinks.length > 0) {
            console.log("🔧 刪除無效的關聯...")
            const deleteResult = await manager.query(`
                DELETE FROM sales_channel_stock_location
                WHERE stock_location_id NOT IN (
                    SELECT id FROM stock_location WHERE deleted_at IS NULL
                ) OR stock_location_id IS NULL
            `)
            console.log("刪除結果:", deleteResult)
        }
        
        // 再次檢查
        const remainingLinks = await manager.query(`
            SELECT scsl.*, sc.name as sc_name, sl.name as sl_name
            FROM sales_channel_stock_location scsl
            JOIN sales_channel sc ON scsl.sales_channel_id = sc.id
            JOIN stock_location sl ON scsl.stock_location_id = sl.id
            WHERE sl.deleted_at IS NULL
        `)
        console.log("清理後剩餘的有效關聯:")
        console.log(remainingLinks)
        
    } catch (err) {
        console.error("錯誤:", err.message)
    }
}
