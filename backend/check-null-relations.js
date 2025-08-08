export default async function({ container }) {
    const query = container.resolve("query")
    
    console.log("=== 檢查和清理無效的 Sales Channel - Stock Location 關聯 ===")
    try {
        // 檢查所有 sales channels
        const allSalesChannels = await query.graph({
            entity: "sales_channels",
            fields: ["id", "name", "stock_locations.id", "stock_locations.name"],
        })
        
        console.log("所有 Sales Channels:")
        allSalesChannels.data.forEach((sc) => {
            console.log(`Sales Channel: ${sc.name} (${sc.id})`)
            console.log(`Stock Locations:`, sc.stock_locations)
            
            const hasNullStockLocation = sc.stock_locations && sc.stock_locations.some(sl => sl === null)
            if (hasNullStockLocation) {
                console.log(`❌ 發現 null stock location 在 Sales Channel ${sc.id}`)
            }
        })
        
        // 檢查所有 stock locations 和它們的狀態
        const allStockLocations = await query.graph({
            entity: "stock_location",
            fields: ["id", "name", "deleted_at"],
        })
        
        console.log("\n所有 Stock Locations:")
        allStockLocations.data.forEach((sl) => {
            console.log(`Stock Location: ${sl.name} (${sl.id})`)
            console.log(`Deleted at: ${sl.deleted_at || 'Not deleted'}`)
        })
        
        // TODO: 需要用適當的方法清理無效關聯
        // 這可能需要直接 SQL 或者透過適當的 service
        
    } catch (err) {
        console.error("錯誤:", err.message)
        console.error("Stack:", err.stack)
    }
}
