"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import React from "react"

/**
 * Use this component to create a Next.js `<Link />` that persists the current country code in the url,
 * without having to explicitly pass it as a prop.
 */
const LocalizedClientLink = ({
  children,
  href,
  ...props
}: {
  children?: React.ReactNode
  href: string
  className?: string
  onClick?: () => void
  passHref?: true
  [x: string]: any
}) => {
  const params = useParams()
  const countryCode = params?.countryCode || 'tw' // 提供一個默認值

  // 確保 href 是以 / 開頭的完整路徑
  const normalizedHref = href.startsWith('/') ? href : `/${href}`
  
  // 如果 href 已經包含 countryCode，直接使用；否則加上 countryCode
  const finalHref = normalizedHref.startsWith(`/${countryCode}`) 
    ? normalizedHref 
    : `/${countryCode}${normalizedHref}`
  
  return (
    <Link href={finalHref} {...props}>
      {children}
    </Link>
  )
}

export default LocalizedClientLink
