import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"

type LineItemOptionsProps = {
  variant: HttpTypes.StoreProductVariant | undefined
  "data-testid"?: string
  "data-value"?: HttpTypes.StoreProductVariant
}

const LineItemOptions = ({
  variant,
  "data-testid": dataTestid,
  "data-value": dataValue,
}: LineItemOptionsProps) => {
  // 如果沒有變體，返回空
  if (!variant) {
    return null
  }

  // 檢查是否有選項資料
  if (variant.options && variant.options.length > 0) {
    // 將選項格式化為可讀的字符串
    const optionsText = variant.options
      .map(option => {
        // 如果有選項標題和值，顯示為 "規格: 單一規格"
        if (option.option?.title && option.value) {
          return `${option.option.title}: ${option.value}`
        }
        // 否則只顯示值
        return option.value
      })
      .filter(Boolean) // 過濾掉空值
      .join(', ') // 用逗號分隔多個選項

    if (optionsText) {
      return (
        <Text
          data-testid={dataTestid}
          data-value={dataValue}
          className="inline-block txt-medium text-ui-fg-subtle w-full overflow-hidden text-ellipsis"
        >
          {optionsText}
        </Text>
      )
    }
  }

  // 如果沒有選項資料但有變體標題，且標題不同於商品標題，則顯示變體標題
  if (variant.title) {
    return (
      <Text
        data-testid={dataTestid}
        data-value={dataValue}
        className="inline-block txt-medium text-ui-fg-subtle w-full overflow-hidden text-ellipsis"
      >
        規格: {variant.title}
      </Text>
    )
  }

  // 否則返回空
  return null
}

export default LineItemOptions
