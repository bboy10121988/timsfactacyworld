import { isEmpty } from "./isEmpty"

type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "en-US",
}: ConvertToLocaleParams) => {
  // 檢查 amount 是否為 undefined 或 null
  if (amount === undefined || amount === null) {
    return "-"
  }

  if (!currency_code || isEmpty(currency_code)) {
    return amount.toString()
  }

  // 對於台幣，使用自定義格式顯示 NT$
  if (currency_code.toUpperCase() === 'TWD') {
    return `NT$${amount.toLocaleString('zh-TW', {
      minimumFractionDigits: minimumFractionDigits ?? 0,
      maximumFractionDigits: maximumFractionDigits ?? 0,
    })}`
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency_code,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount)
}
