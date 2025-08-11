import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function listPublishableKeys({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  try {
    // 使用模組綁定存取 API Key 服務
    const apiKeyModuleService = container.resolve(Modules.API_KEY)

    const keys = await apiKeyModuleService.listApiKeys({
      type: "publishable",
    })

    if (!keys?.length) {
      logger.info("No publishable API keys found.")
      return
    }

    console.log("Found publishable API keys:")
    for (const k of keys) {
      console.log("- id:", k.id)
      // token 只在建立時可回傳；若無 token 欄位，代表需重新建立
      // 但在某些安裝中，token 可能隱藏；若存在，就輸出。
      // @ts-ignore
      if (k.token) {
        // @ts-ignore
        console.log("  token:", k.token)
      } else {
        console.log("  token: <hidden - create a new one to retrieve token>")
      }
      console.log("  title:", k.title)
      console.log("  revoked_at:", k.revoked_at)
      console.log("  created_at:", k.created_at)
    }
  } catch (e) {
    logger.error("Failed to list publishable API keys:", e)
  }
}
