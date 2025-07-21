"use client"

import React from "react"
import { getButtonClasses, loadingSpinnerClasses, spinnerClasses } from "@/styles/button-styles"

export interface UnifiedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isLoading?: boolean
  loadingText?: string
  children: React.ReactNode
}

export const UnifiedButton = React.forwardRef<HTMLButtonElement, UnifiedButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    isLoading = false, 
    loadingText,
    className = '',
    disabled,
    children,
    ...props 
  }, ref) => {
    const buttonClasses = getButtonClasses(variant, size, isLoading, className)
    
    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className={loadingSpinnerClasses}>
            <div className={spinnerClasses}></div>
            {loadingText || '載入中...'}
          </div>
        ) : (
          children
        )}
      </button>
    )
  }
)

UnifiedButton.displayName = 'UnifiedButton'

export default UnifiedButton
