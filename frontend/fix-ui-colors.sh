#!/bin/bash

# 批量替換 Medusa UI 配色類別為標準 Tailwind 類別
# 在結帳模組中執行

FILES="src/modules/checkout/components/payment-container/index.tsx src/modules/checkout/components/payment/index.tsx src/modules/checkout/components/shipping/index.tsx src/modules/checkout/components/addresses/index.tsx src/modules/checkout/components/review/index.tsx src/modules/checkout/components/discount-code/index.tsx src/modules/checkout/components/address-select/index.tsx"

for file in $FILES; do
  if [ -f "$file" ]; then
    echo "處理檔案: $file"
    
    # 文字顏色替換
    sed -i '' 's/text-ui-fg-base/text-gray-900/g' "$file"
    sed -i '' 's/text-ui-fg-subtle/text-gray-600/g' "$file"
    sed -i '' 's/text-ui-fg-muted/text-gray-500/g' "$file"
    sed -i '' 's/text-ui-fg-disabled/text-gray-400/g' "$file"
    sed -i '' 's/text-ui-fg-interactive/text-blue-600/g' "$file"
    sed -i '' 's/hover:text-ui-fg-interactive-hover/hover:text-blue-800/g' "$file"
    
    # 背景顏色替換
    sed -i '' 's/bg-ui-bg-base/bg-white/g' "$file"
    sed -i '' 's/bg-ui-bg-subtle/bg-gray-50/g' "$file"
    sed -i '' 's/bg-ui-bg-field/bg-gray-50/g' "$file"
    sed -i '' 's/hover:bg-ui-bg-field-hover/hover:bg-gray-100/g' "$file"
    sed -i '' 's/bg-ui-button-primary/bg-gray-900/g' "$file"
    sed -i '' 's/bg-ui-button-neutral-hover/bg-gray-200/g' "$file"
    
    # 邊框顏色替換
    sed -i '' 's/border-ui-border-base/border-gray-200/g' "$file"
    sed -i '' 's/border-ui-border-strong/border-gray-400/g' "$file"
    sed -i '' 's/border-ui-border-interactive/border-gray-900/g' "$file"
    
    echo "✓ 完成: $file"
  else
    echo "⚠ 檔案不存在: $file"
  fi
done

echo "批量替換完成！"
