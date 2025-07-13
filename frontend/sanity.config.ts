import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import { schemaTypes } from './schemas'
import { WEBHOOK_URL, WEBHOOK_SECRET } from './src/config/webhook'
import type {DocumentActionProps} from 'sanity'

const GeneratePageAction = (props: DocumentActionProps) => {
  const {draft, published} = props

  // 沒有已發布的文檔時不顯示這個動作
  if (!published) return null

  return {
    label: '生成頁面',
    onHandle: async () => {
      try {
        const response = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-webhook-secret': WEBHOOK_SECRET
          },
          body: JSON.stringify({
            event: 'page.publish',
            documentId: published._id
          })
        })

        if (!response.ok) {
          throw new Error('頁面生成失敗')
        }

        return { message: '頁面生成成功!' }

      } catch (error) {
        console.error('頁面生成錯誤:', error)
        return { message: '頁面生成失敗,請稍後再試' }
      }
    }
  }
}

export default defineConfig({
  name: 'default', 
  title: 'tims_web',

  projectId: 'm7o2mv1n',
  dataset: 'production',

  plugins: [
    structureTool(),
    visionTool()
  ],

  document: {
    actions: (prev, context) => 
      context.schemaType === 'pages' 
        ? [...prev, GeneratePageAction]
        : prev
  },

  schema: {
    types: schemaTypes,
  },
})
