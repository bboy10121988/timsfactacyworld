import { medusaIntegrationTestRunner } from "@medusajs/test-utils"

async function debugPricing() {
  const testContext: any = await medusaIntegrationTestRunner({
    testSuite: () => {}
  })

  if (!testContext || !testContext.container) {
    throw new Error("Test context or container is undefined. Please check medusaIntegrationTestRunner's return value.")
  }
  
  try {
    console.log("🔍 Testing price calculation...")
    
    // 取得服務
    const productService = testContext.container.resolve("productService")
    const pricingService = testContext.container.resolve("pricingService")
    
    // 檢查商品變體
    const variant = await productService.retrieveProductVariant("variant_01JW1N0A9DSKBGGZECDBGYTTR2", {
      relations: ["price_set"]
    })
    console.log("📦 Product variant:", {
      id: variant.id,
      title: variant.title,
      price_set_id: variant.price_set?.id
    })
    
    // 檢查價格
    if (variant.price_set?.id) {
      const prices = await pricingService.listPrices({
        price_set_id: [variant.price_set.id]
      })
      console.log("💰 Available prices:", prices.map(p => ({
        currency: p.currency_code,
        amount: p.amount,
        raw_amount: p.raw_amount
      })))
    }
    
  } catch (error) {
    console.error("❌ Error:", error)
  }
  
  process.exit(0)
}

debugPricing()
