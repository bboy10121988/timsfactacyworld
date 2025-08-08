export default async function({ container }) {
    const query = container.resolve("query")
    
    console.log("=== 模擬 Medusa 核心流程以找出問題 ===")
    try {
        // 模擬 Medusa core-flows 的查詢
        const scFulfillmentSetQuery = await query.graph({
            entity: "sales_channels",
            filters: { id: "sc_01JW1N088DN1AACWFHRFW2ZT6X" }, // 使用你的 sales channel ID
            fields: [
                "stock_locations.fulfillment_sets.id",
                "stock_locations.id",
                "stock_locations.name",
                "stock_locations.address.*",
            ],
        })
        
        console.log("Sales Channel Query Result:")
        console.log(JSON.stringify(scFulfillmentSetQuery, null, 2))
        
        const scFulfillmentSets = scFulfillmentSetQuery.data[0]
        console.log("\nscFulfillmentSets:")
        console.log(JSON.stringify(scFulfillmentSets, null, 2))
        
        // 模擬 transform 邏輯
        console.log("\n=== 模擬 Transform 邏輯 ===")
        const fulfillmentSetIds = new Set()
        
        if (scFulfillmentSets && scFulfillmentSets.stock_locations) {
            scFulfillmentSets.stock_locations.forEach((stockLocation) => {
                console.log(`Processing stock location: ${stockLocation.name} (${stockLocation.id})`)
                console.log(`fulfillment_sets type:`, typeof stockLocation.fulfillment_sets)
                console.log(`fulfillment_sets value:`, stockLocation.fulfillment_sets)
                
                if (stockLocation.fulfillment_sets === null) {
                    console.log("❌ 找到問題！fulfillment_sets 是 null")
                } else if (Array.isArray(stockLocation.fulfillment_sets)) {
                    console.log(`✅ fulfillment_sets 是陣列，長度: ${stockLocation.fulfillment_sets.length}`)
                    stockLocation.fulfillment_sets.forEach((fulfillmentSet) => {
                        fulfillmentSetIds.add(fulfillmentSet.id)
                        console.log(`  - 加入 fulfillment set: ${fulfillmentSet.id}`)
                    })
                } else {
                    console.log("❌ fulfillment_sets 不是陣列也不是 null，這很奇怪")
                }
            })
        }
        
        console.log(`\n最終 fulfillmentSetIds:`, Array.from(fulfillmentSetIds))
        
    } catch (err) {
        console.error("錯誤:", err.message)
        console.error("Stack:", err.stack)
    }
}
