export default async function({ container }) {
    const query = container.resolve("query")
    
    console.log("=== 檢查詳細的 Sales Channel -> Stock Location -> Fulfillment Set 關聯 ===")
    try {
        const salesChannels = await query.graph({
            entity: "sales_channels",
            fields: [
                "id", 
                "name",
                "stock_locations.id",
                "stock_locations.name", 
                "stock_locations.fulfillment_sets.*"
            ],
        })
        
        salesChannels.data.forEach((sc, index) => {
            console.log(`${index + 1}. Sales Channel: ${sc.name} (${sc.id})`)
            if (sc.stock_locations && sc.stock_locations.length > 0) {
                sc.stock_locations.forEach((sl, slIndex) => {
                    console.log(`  ${slIndex + 1}. Stock Location: ${sl.name} (${sl.id})`)
                    console.log(`     Fulfillment Sets 完整資料:`, JSON.stringify(sl.fulfillment_sets, null, 4))
                    
                    // 特別檢查 fulfillment_sets 是否為陣列
                    if (Array.isArray(sl.fulfillment_sets)) {
                        console.log(`     ✅ fulfillment_sets 是陣列，長度: ${sl.fulfillment_sets.length}`)
                        sl.fulfillment_sets.forEach((fs, fsIndex) => {
                            console.log(`       ${fsIndex + 1}. ${JSON.stringify(fs)}`)
                        })
                    } else {
                        console.log(`     ❌ fulfillment_sets 不是陣列，類型: ${typeof sl.fulfillment_sets}`)
                        console.log(`     值: ${sl.fulfillment_sets}`)
                    }
                })
            } else {
                console.log(`  ❌ 沒有 stock_locations`)
            }
        })
        
    } catch (err) {
        console.error("查詢錯誤:", err.message)
        console.error("Stack:", err.stack)
    }
}
