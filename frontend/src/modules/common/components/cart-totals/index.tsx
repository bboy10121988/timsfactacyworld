"use client"

import { convertToLocale } from "@lib/util/money"
import React from "react"

type CartTotalsProps = {
  totals: {
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    shipping_total?: number | null
    discount_total?: number | null
    gift_card_total?: number | null
    currency_code: string
    shipping_subtotal?: number | null
  }
}

const CartTotals: React.FC<CartTotalsProps> = ({ totals }) => {
  const {
    currency_code,
    total,
    subtotal,
    tax_total,
    discount_total,
    gift_card_total,
    shipping_subtotal,
  } = totals

  return (
    <div className="space-y-4">
      {/* Subtotal and discounts */}
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">小計</span>
          <span className="font-medium text-gray-900" data-testid="cart-subtotal" data-value={subtotal || 0}>
            {convertToLocale({ amount: subtotal ?? 0, currency_code })}
          </span>
        </div>
        
        {!!discount_total && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">優惠折扣</span>
            <span
              className="font-medium text-green-600"
              data-testid="cart-discount"
              data-value={discount_total || 0}
            >
              -{convertToLocale({ amount: discount_total ?? 0, currency_code })}
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">運費</span>
          <span className="font-medium text-gray-900" data-testid="cart-shipping" data-value={shipping_subtotal || 0}>
            {shipping_subtotal === 0 ? "免費" : convertToLocale({ amount: shipping_subtotal ?? 0, currency_code })}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">稅金</span>
          <span className="font-medium text-gray-900" data-testid="cart-taxes" data-value={tax_total || 0}>
            {convertToLocale({ amount: tax_total ?? 0, currency_code })}
          </span>
        </div>
        
        {!!gift_card_total && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">禮品卡</span>
            <span
              className="font-medium text-green-600"
              data-testid="cart-gift-card-amount"
              data-value={gift_card_total || 0}
            >
              -{convertToLocale({ amount: gift_card_total ?? 0, currency_code })}
            </span>
          </div>
        )}
      </div>
      
      {/* Divider */}
      <div className="border-t border-gray-200"></div>
      
      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-gray-900">總計</span>
        <span
          className="text-xl font-bold text-gray-900"
          data-testid="cart-total"
          data-value={total || 0}
        >
          {convertToLocale({ amount: total ?? 0, currency_code })}
        </span>
      </div>
    </div>
  )
}

export default CartTotals
