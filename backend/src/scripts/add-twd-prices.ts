import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
} from "@medusajs/framework/utils";

export default async function addTWDPrices({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  logger.info("Adding TWD prices to all products...");

  // 使用 SQL 直接添加 TWD 價格
  // 假設匯率：1 USD = 32 TWD, 1 EUR = 35 TWD
  
  const queries = [
    // 為所有有 USD 價格的變體添加 TWD 價格
    `
    INSERT INTO money_amount (id, currency_code, amount, min_quantity, max_quantity, price_set_id, created_at, updated_at)
    SELECT 
      'ma_' || substr(md5(random()::text), 1, 26) as id,
      'twd' as currency_code,
      CAST(amount * 32 as INTEGER) as amount,
      min_quantity,
      max_quantity,
      price_set_id,
      NOW() as created_at,
      NOW() as updated_at
    FROM money_amount 
    WHERE currency_code = 'usd' 
    AND NOT EXISTS (
      SELECT 1 FROM money_amount ma2 
      WHERE ma2.price_set_id = money_amount.price_set_id 
      AND ma2.currency_code = 'twd'
    );
    `,
    // 為只有 EUR 價格但沒有 USD 價格的變體添加 TWD 價格
    `
    INSERT INTO money_amount (id, currency_code, amount, min_quantity, max_quantity, price_set_id, created_at, updated_at)
    SELECT 
      'ma_' || substr(md5(random()::text), 1, 26) as id,
      'twd' as currency_code,
      CAST(amount * 35 as INTEGER) as amount,
      min_quantity,
      max_quantity,
      price_set_id,
      NOW() as created_at,
      NOW() as updated_at
    FROM money_amount 
    WHERE currency_code = 'eur' 
    AND NOT EXISTS (
      SELECT 1 FROM money_amount ma2 
      WHERE ma2.price_set_id = money_amount.price_set_id 
      AND ma2.currency_code = 'twd'
    )
    AND NOT EXISTS (
      SELECT 1 FROM money_amount ma3 
      WHERE ma3.price_set_id = money_amount.price_set_id 
      AND ma3.currency_code = 'usd'
    );
    `
  ];

  const dbConnection = container.resolve('dbConnection') as any;
  
  for (const query of queries) {
    try {
      const result = await dbConnection.raw(query);
      logger.info(`Executed query, affected rows: ${result.rowCount || 'unknown'}`);
    } catch (error) {
      logger.error(`Error executing query: ${error.message}`);
    }
  }

  logger.info("Finished adding TWD prices to products");
}
