/**
 * 統一按鈕樣式配置
 * 為整個應用程式提供一致的按鈕外觀和行為
 */

export const buttonBaseClasses = [
  "inline-flex",
  "items-center",
  "justify-center",
  "rounded-md",
  "font-medium",
  "transition-all",
  "duration-200",
  "focus:outline-none",
  "focus:ring-2",
  "focus:ring-offset-2",
  "disabled:opacity-50",
  "disabled:cursor-not-allowed",
  "disabled:pointer-events-none"
].join(" ")

export const buttonVariants = {
  primary: [
    "bg-gray-900",
    "text-white",
    "hover:bg-gray-800",
    "focus:ring-gray-900",
    "shadow-sm",
    "hover:shadow-md"
  ].join(" "),
  
  secondary: [
    "bg-white",
    "text-gray-900",
    "border",
    "border-gray-300",
    "hover:bg-gray-50",
    "focus:ring-gray-500",
    "shadow-sm",
    "hover:shadow-md"
  ].join(" "),
  
  ghost: [
    "bg-transparent",
    "text-gray-700",
    "hover:bg-gray-100",
    "hover:text-gray-900",
    "focus:ring-gray-500"
  ].join(" "),
  
  danger: [
    "bg-red-600",
    "text-white",
    "hover:bg-red-700",
    "focus:ring-red-500",
    "shadow-sm",
    "hover:shadow-md"
  ].join(" "),
  
  success: [
    "bg-green-600",
    "text-white",
    "hover:bg-green-700",
    "focus:ring-green-500",
    "shadow-sm",
    "hover:shadow-md"
  ].join(" ")
}

export const buttonSizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
  xl: "px-8 py-4 text-lg"
}

export const buttonLoadingClasses = [
  "relative",
  "disabled:cursor-wait"
].join(" ")

/**
 * 生成統一的按鈕類名
 */
export function getButtonClasses(
  variant: keyof typeof buttonVariants = 'primary',
  size: keyof typeof buttonSizes = 'md',
  isLoading = false,
  className = ''
): string {
  const classes = [
    buttonBaseClasses,
    buttonVariants[variant],
    buttonSizes[size],
    isLoading ? buttonLoadingClasses : '',
    className
  ].filter(Boolean).join(' ')
  
  return classes
}

/**
 * 載入中狀態的樣式類名
 */
export const loadingSpinnerClasses = [
  "flex",
  "items-center", 
  "justify-center"
].join(" ")

export const spinnerClasses = [
  "w-4",
  "h-4", 
  "border-2",
  "border-current",
  "border-t-transparent",
  "rounded-full",
  "animate-spin",
  "mr-2"
].join(" ")

/**
 * 導航按鈕專用樣式
 */
export const navButtonClasses = [
  "text-[13px]",
  "tracking-wider",
  "uppercase",
  "font-medium",
  "hover:text-black/70",
  "transition-colors",
  "duration-200",
  "flex",
  "items-center",
  "gap-2"
].join(" ")
