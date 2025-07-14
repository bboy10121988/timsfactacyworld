import { EllipseMiniSolid } from "@medusajs/icons"
import { Label, RadioGroup, Text, clx } from "@medusajs/ui"

type FilterRadioGroupProps = {
  title: string
  items: {
    value: string
    label: string
  }[]
  value: any
  handleChange: (...args: any[]) => void
  "data-testid"?: string
}

const FilterRadioGroup = ({
  title,
  items,
  value,
  handleChange,
  "data-testid": dataTestId,
}: FilterRadioGroupProps) => {
  return (
    <div className="flex items-center gap-x-6">
      <Text className="text-sm font-medium text-gray-700 whitespace-nowrap">{title}</Text>
      <RadioGroup data-testid={dataTestId} onValueChange={handleChange}>
        <div className="flex items-center">
          {items?.map((i, index) => (
            <div key={i.value} className="flex items-center">
              <div
                className={clx("flex gap-x-2 items-center cursor-pointer px-4", {
                  "ml-[-20px]": i.value === value,
                })}
              >
                {i.value === value && <EllipseMiniSolid className="text-gray-900" />}
                <RadioGroup.Item
                  checked={i.value === value}
                  className="hidden peer"
                  id={i.value}
                  value={i.value}
                />
                <Label
                  htmlFor={i.value}
                  className={clx(
                    "text-sm cursor-pointer transition-colors whitespace-nowrap",
                    {
                      "text-gray-900 font-medium": i.value === value,
                      "text-gray-600 hover:text-gray-800": i.value !== value,
                    }
                  )}
                  data-testid="radio-label"
                  data-active={i.value === value}
                >
                  {i.label}
                </Label>
              </div>
              {/* 間隔線 - 不顯示在最後一個選項後面 */}
              {index < items.length - 1 && (
                <div className="h-4 w-px bg-gray-300 mx-2"></div>
              )}
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  )
}

export default FilterRadioGroup
