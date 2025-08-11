import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createApiKeysWorkflow, linkSalesChannelsToApiKeyWorkflow, createSalesChannelsWorkflow } from "@medusajs/medusa/core-flows"

export default async function createPk({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)

  try {
    let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
      name: "Default Sales Channel",
    })

    if (!defaultSalesChannel.length) {
      const { result } = await createSalesChannelsWorkflow(container).run({
        input: {
          salesChannelsData: [
            {
              name: "Default Sales Channel",
            },
          ],
        },
      })
      defaultSalesChannel = result
    }

    const { result: keys } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: "Store Publishable Key",
            type: "publishable",
            created_by: "script",
          },
        ],
      },
    })

    const key = keys[0]

    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: {
        id: key.id,
        add: [defaultSalesChannel[0].id],
      },
    })

    console.log("Created publishable API key:")
    console.log("ID:", key.id)
    // publishable key token is returned on creation
    // @ts-ignore
    console.log("Token:", key.token)
    console.log("Use this value as x-publishable-api-key and NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY")
  } catch (e) {
    logger.error("Failed to create publishable API key:", e)
  }
}
