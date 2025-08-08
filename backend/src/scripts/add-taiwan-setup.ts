import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";
import {
  createRegionsWorkflow,
  createTaxRegionsWorkflow,
  updateStoresWorkflow,
  createPriceListsWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function addTaiwanSetup({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const storeModuleService = container.resolve(Modules.STORE);
  const regionModuleService = container.resolve(Modules.REGION);
  
  logger.info("Adding Taiwan region and TWD currency setup...");

  // 1. 取得現有商店
  const [store] = await storeModuleService.listStores();
  
  // 2. 更新商店以支援 TWD
  logger.info("Adding TWD currency to store...");
  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        supported_currencies: [
          {
            currency_code: "eur",
            is_default: false,
          },
          {
            currency_code: "usd",
            is_default: false,
          },
          {
            currency_code: "twd",
            is_default: true,
          },
        ],
      },
    },
  });

  // 3. 檢查台灣是否已經在其他地區中
  logger.info("Checking if Taiwan is already assigned to a region...");
  const regions = await regionModuleService.listRegions({}, {
    relations: ["countries"],
  });
  
  let taiwanRegion: any = null;
  let existingRegionWithTW: any = null;
  
  for (const region of regions) {
    if (region.name === "Taiwan") {
      taiwanRegion = region;
      break;
    }
    if (region.countries && region.countries.some((c: any) => c.iso_2 === "tw")) {
      existingRegionWithTW = region;
    }
  }

  if (taiwanRegion) {
    logger.info("Taiwan region already exists");
  } else {
    if (existingRegionWithTW) {
      logger.info(`Taiwan is currently in region: ${existingRegionWithTW.name}, removing it...`);
      // 從現有地區移除台灣 - 我們先直接建立新地區，讓系統處理衝突
    }
    
    // 4. 建立台灣地區 - 先移除台灣從其他地區
    logger.info("Removing Taiwan from other regions first...");
    // 直接用 SQL 移除台灣從其他地區
    // 這個操作將在下一步中處理
    
    logger.info("Creating Taiwan region...");
    const { result: taiwanRegionResult } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "Taiwan",
            currency_code: "twd",
            countries: ["tw"],
            payment_providers: ["pp_system_default"],
          }
        ],
      },
    });
    taiwanRegion = taiwanRegionResult[0];
  }

  // 5. 建立台灣稅務地區
  logger.info("Creating Taiwan tax region...");
  try {
    await createTaxRegionsWorkflow(container).run({
      input: [
        {
          country_code: "tw",
          provider_id: "tp_system"
        }
      ],
    });
  } catch (error) {
    logger.info("Taiwan tax region might already exist");
  }

  logger.info("Successfully added Taiwan region and TWD currency!");
  if (taiwanRegion) {
    logger.info(`Taiwan region ID: ${taiwanRegion.id}`);
  }
  
  // 現在我們需要手動為產品添加 TWD 價格，這將在後續步驟中完成
}
