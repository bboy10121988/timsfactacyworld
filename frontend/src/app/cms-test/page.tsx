'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// 動態導入 NextStudio 以避免 SSR 問題
const NextStudio = dynamic(
  () => import('next-sanity/studio').then((mod) => mod.NextStudio),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Loading Sanity Studio
          </h2>
          <p className="text-gray-500">
            Initializing Content Management System...
          </p>
        </div>
      </div>
    ),
  }
)

// 動態導入配置以避免服務器端問題
const getConfig = async () => {
  try {
    const config = await import('../../../../sanity.config.simple')
    return config.default
  } catch (error) {
    console.error('Failed to load Sanity config:', error)
    return null
  }
}

export default function StudioPage() {
  const [config, setConfig] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getConfig()
      .then(setConfig)
      .catch((err) => {
        console.error('Config loading error:', err)
        setError(err.message)
      })
  }, [])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center p-8">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-800 mb-4">
            CMS Configuration Error
          </h2>
          <p className="text-red-600 mb-6">
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Loading Configuration
          </h2>
          <p className="text-gray-500">
            Preparing Sanity Studio...
          </p>
        </div>
      </div>
    )
  }

  return <NextStudio config={config} />
}
