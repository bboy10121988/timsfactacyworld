import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'seoMeta',
  title: 'SEO 優化設定',
  type: 'object',
  description: '搜尋引擎優化與社群媒體分享設定',
  options: {
    collapsible: true,
    collapsed: true,
  },
  fieldsets: [
    {
      name: 'basic',
      title: '🔍 基礎 SEO 設定',
      options: { collapsible: true, collapsed: false }
    },
    {
      name: 'advanced',
      title: '⚙️ 進階 SEO 設定',
      options: { collapsible: true, collapsed: true }
    },
    {
      name: 'social',
      title: '📱 社群媒體分享',
      options: { collapsible: true, collapsed: true }
    }
  ],
  fields: [
    // 基礎 SEO 設定
    defineField({
      name: 'seoTitle',
      title: 'SEO 標題',
      type: 'string',
      description: '顯示在搜尋結果中的標題 (建議 50-60 字元)',
      fieldset: 'basic',
      validation: Rule => Rule.max(60).warning('建議保持在 60 字元以內以確保在搜尋結果中完整顯示')
    }),
    defineField({
      name: 'seoDescription',
      title: 'Meta 描述',
      type: 'text',
      rows: 3,
      description: '顯示在搜尋結果中的描述 (建議 150-160 字元)',
      fieldset: 'basic',
      validation: Rule => Rule.max(160).warning('建議保持在 160 字元以內以確保在搜尋結果中完整顯示')
    }),
    defineField({
      name: 'seoKeywords',
      title: 'SEO 關鍵字',
      type: 'array',
      of: [{ type: 'string' }],
      description: '選擇 3-5 個主要關鍵字，用於搜尋引擎優化',
      fieldset: 'basic',
      options: {
        layout: 'tags'
      },
      validation: Rule => Rule.max(8).warning('建議不超過 8 個關鍵字')
    }),

    // 進階 SEO 設定
    defineField({
      name: 'canonicalUrl',
      title: '標準網址',
      type: 'url',
      description: '如果存在重複內容，請指定首選網址',
      fieldset: 'advanced'
    }),
    defineField({
      name: 'noIndex',
      title: '禁止搜尋引擎索引',
      type: 'boolean',
      description: '啟用後，搜尋引擎將不會收錄此頁面',
      fieldset: 'advanced',
      initialValue: false
    }),
    defineField({
      name: 'noFollow',
      title: '禁止跟隨連結',
      type: 'boolean',
      description: '啟用後，搜尋引擎將不會跟隨此頁面中的連結',
      fieldset: 'advanced',
      initialValue: false
    }),
    defineField({
      name: 'priority',
      title: '頁面優先級',
      type: 'number',
      description: '相對於網站其他頁面的優先級 (0.0 - 1.0)',
      fieldset: 'advanced',
      options: {
        list: [
          { title: '最低 (0.1)', value: 0.1 },
          { title: '低 (0.3)', value: 0.3 },
          { title: '中等 (0.5)', value: 0.5 },
          { title: '高 (0.8)', value: 0.8 },
          { title: '最高 (1.0)', value: 1.0 }
        ]
      },
      initialValue: 0.5
    }),

    // 社群媒體分享設定
    defineField({
      name: 'ogTitle',
      title: '社群分享標題',
      type: 'string',
      description: '在社群媒體分享時顯示的標題（如未填寫將使用 SEO 標題）',
      fieldset: 'social'
    }),
    defineField({
      name: 'ogDescription',
      title: '社群分享描述',
      type: 'text',
      rows: 2,
      description: '在社群媒體分享時顯示的描述（如未填寫將使用 Meta 描述）',
      fieldset: 'social'
    }),
    defineField({
      name: 'ogImage',
      title: '社群分享圖片',
      type: 'image',
      description: '在社群媒體分享時顯示的圖片 (建議 1200x630 像素)',
      fieldset: 'social',
      options: {
        hotspot: true
      },
      fields: [
        defineField({
          name: 'alt',
          title: '圖片替代文字',
          type: 'string',
          description: '重要！用於無障礙和 SEO 優化',
          validation: Rule => Rule.required()
        })
      ]
    }),
    defineField({
      name: 'twitterCard',
      title: 'Twitter 卡片類型',
      type: 'string',
      description: 'Twitter 分享時的卡片樣式',
      fieldset: 'social',
      options: {
        list: [
          { title: '摘要卡片', value: 'summary' },
          { title: '大圖摘要卡片', value: 'summary_large_image' },
          { title: '應用程式卡片', value: 'app' },
          { title: '播放器卡片', value: 'player' }
        ]
      },
      initialValue: 'summary_large_image'
    })
  ],
  preview: {
    select: {
      title: 'seoTitle',
      description: 'seoDescription',
      ogImage: 'ogImage'
    },
    prepare({ title, description, ogImage }) {
      return {
        title: title || '尚未設定 SEO 標題',
        subtitle: description || '尚未設定 Meta 描述',
        media: ogImage
      }
    }
  }
})
