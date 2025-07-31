'use client'

import dynamic from 'next/dynamic'
import { NextStudio } from 'next-sanity/studio'
import config from '../../../sanity.config'

// 动态加载 Studio 组件，禁用 SSR
const Studio = dynamic(() => import('next-sanity/studio').then((mod) => mod.NextStudio), {
  ssr: false,
  loading: () => <div>Loading Studio...</div>
})

export default function StudioPage() {
  return <Studio config={config} />
}
