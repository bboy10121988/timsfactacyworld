"use client"

import React, { forwardRef } from "react"
import clsx from "clsx"

type ButtonProps = {
  variant?: "primary" | "secondary" | "danger"
  size?: "small" | "medium" | "large"
  isLoading?: boolean
  children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "medium",
      isLoading = false,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      primary: "bg-blue-500 hover:bg-blue-600 text-white",
      secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700",
      danger: "bg-red-500 hover:bg-red-600 text-white",
    }

    const sizeClasses = {
      small: "px-3 py-1.5 text-sm",
      medium: "px-4 py-2",
      large: "px-6 py-3 text-lg",
    }

    return (
      <button
        ref={ref}
        className={clsx(
          "rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <div className="w-4 h-4 rounded-full border-2 border-current border-r-transparent animate-spin" />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"

export default Button
