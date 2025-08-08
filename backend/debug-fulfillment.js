export default async function({ container }) {
    const query = container.resolve("query")
    
    console.log("=== 檢查 Sales Channel 和 Stock Location 關聯 ===")
    try {
        const salesChannels = await query.graph({
            entity: "sales_channels",
            fields: [
                "id", 
                "name",
                "stock_locations.id",
                "stock_locations.name", 
                "stock_locations.fulfillment_sets.id",
                "stock_locations.fulfillment_sets.name"
            ],
        })
        
        console.log("Sales Channels 資料:")
        salesChannels.data.forEach((sc, index) => {
            console.log(`${index + 1}. Sales Channel: ${sc.name} (${sc.id})`)
            if (sc.stock_locations && sc.stock_locations.length > 0) {
                sc.stock_locations.forEach((sl, slIndex) => {
                    console.log(`  ${slIndex + 1}. Stock Location: ${sl.name} (${sl.id})`)
                    if (sl.fulfillment_sets) {
                        if (sl.fulfillment_sets.length > 0) {
                            sl.fulfillment_sets.forEach((fs, fsIndex) => {
                                console.log(`    ${fsIndex + 1}. Fulfillment Set: ${fs.name || 'N/A'} (${fs.id})`)
                            })
                        } else {
                            console.log(`    ❌ 沒有 fulfillment_sets`)
                        }
                    } else {
                        console.log(`    ❌ fulfillment_sets 是 null`)
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
