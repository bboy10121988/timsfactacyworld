/**
 * This route is responsible for the embedded Sanity Studio.
 */

'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '../../../../sanity.config.simple'
import { useEffect, useState } from 'react'

export default function StudioPage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // 只在客戶端渲染 Sanity Studio
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CMS Studio...</p>
        </div>
      </div>
    )
  }

  return <NextStudio config={config} />
}
