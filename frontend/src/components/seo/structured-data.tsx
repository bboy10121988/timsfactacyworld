'use client'

import { useEffect } from 'react'

interface StructuredDataProps {
  data: string | null
  type?: string
}

export default function StructuredData({ data, type = 'application/ld+json' }: StructuredDataProps) {
  useEffect(() => {
    if (data && process.env.NODE_ENV === 'development') {
      try {
        const parsed = JSON.parse(data)
        console.log('📊 結構化資料 (Structured Data):', parsed)
      } catch (error) {
        console.error('❌ 無效的結構化資料格式:', error)
      }
    }
  }, [data])

  if (!data) return null

  return (
    <script
      type={type}
      dangerouslySetInnerHTML={{
        __html: data
      }}
    />
  )
}
