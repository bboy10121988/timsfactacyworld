"use client"

import { ProductOptionValue } from "@medusajs/medusa"
import { HttpTypes } from "@medusajs/types"
import clsx from "clsx"
import { forwardRef } from "react"

type OptionSelectProps = {
  option: {
    title: string
    id: string
  }
  current: string | null
  variants: HttpTypes.StoreProduct["variants"]
  onSelect: (value: string) => void
}

const OptionSelect = forwardRef<HTMLButtonElement, OptionSelectProps>(
  ({ option, current, variants, onSelect }, ref) => {
    const values = Array.from(
      new Set(
        variants.map((variant) => {
          const value = variant.options.find(
            (option_value) => option_value.option_id === option.id
          )
          return value?.value
        })
      )
    ).filter((value): value is string => typeof value === "string")

    return (
      <div className="flex flex-col gap-y-3">
        <span className="text-sm font-medium text-gray-700">
          {option.title}
        </span>
        <div className="flex flex-wrap gap-2">
          {values.map((value) => {
            const selected = current === value

            return (
              <button
                ref={ref}
                key={value}
                onClick={() => onSelect(value)}
                className={clsx(
                  "border rounded-lg px-4 py-2 text-sm flex items-center gap-2 min-h-[40px]",
                  {
                    "border-gray-200 hover:border-gray-900 hover:bg-gray-100":
                      !selected,
                    "border-gray-900 bg-gray-100": selected,
                  }
                )}
              >
                {value}
              </button>
            )
          })}
        </div>
      </div>
    )
  }
)

OptionSelect.displayName = "OptionSelect"

export default OptionSelect
