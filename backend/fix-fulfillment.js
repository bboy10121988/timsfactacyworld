export default async function({ container }) {
    const query = container.resolve("query")
    
    console.log("=== 檢查和修復 Fulfillment Set ===")
    try {
        // 檢查所有 fulfillment sets
        const fulfillmentSets = await query.graph({
            entity: "fulfillment_set",
            fields: ["id", "name", "type"],
        })
        
        console.log("Fulfillment Sets:")
        fulfillmentSets.data.forEach((fs, index) => {
            console.log(`${index + 1}. ID: ${fs.id}`)
            console.log(`   Name: ${fs.name || 'NULL'}`)
            console.log(`   Type: ${fs.type || 'NULL'}`)
            console.log(`   ---`)
        })
        
        // 修復沒有 name 的 fulfillment sets
        if (fulfillmentSets.data.length > 0) {
            const fulfillmentSetService = container.resolve("fulfillmentSetService")
            
            for (const fs of fulfillmentSets.data) {
                if (!fs.name) {
                    console.log(`🔧 修復 Fulfillment Set ${fs.id} - 設定 name`)
                    try {
                        await fulfillmentSetService.update(fs.id, {
                            name: `Fulfillment Set ${fs.id.slice(-8)}`,
                            type: fs.type || "shipping"
                        })
                        console.log(`✅ 已修復 Fulfillment Set ${fs.id}`)
                    } catch (err) {
                        console.error(`❌ 修復失敗 ${fs.id}:`, err.message)
                    }
                }
            }
        }
        
    } catch (err) {
        console.error("錯誤:", err.message)
    }
}
