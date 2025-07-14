import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
}) => {
  const filteredOptions = (option.values ?? []).map((v) => v.value)

  return (
    <div className="flex flex-col gap-y-3">
      <div
        className="grid grid-cols-3 sm:grid-cols-4 gap-2"
        data-testid={dataTestId}
      >
        {filteredOptions.map((v) => {
          return (
            <button
              onClick={() => updateOption(option.id, v)}
              key={v}
              className={clx(
                "border h-12 text-sm flex items-center justify-center transition-all duration-200 ease-in-out rounded-md relative overflow-hidden",
                {
                  "border-black bg-black text-white font-medium": v === current,
                  "border-gray-200 bg-white text-gray-800 hover:border-gray-500": v !== current,
                  "opacity-50 cursor-not-allowed": disabled,
                }
              )}
              disabled={disabled}
              data-testid="option-button"
            >
              {v === current && (
                <span className="absolute top-0 right-0">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M0 0L20 0L20 20L0 0Z" />
                  </svg>
                </span>
              )}
              {v}
            </button>
          )
        })}
      </div>
      
      {/* 顯示選擇提示 */}
      {!current && (
        <p className="text-xs text-orange-500 mt-1">請選擇{title}</p>
      )}
    </div>
  )
}

export default OptionSelect
