import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'seoMeta',
  title: 'SEO元數據(metadata)',
  type: 'object',
  fields: [
    defineField({
      name: 'seoTitle',
      title: 'SEO標題(metadata)',
      type: 'string',
      description: 'Title for search engines (60 characters recommended)'
    }),
    defineField({
      name: 'seoDescription',
      title: 'Meta描述(metadata)',
      type: 'text',
      description: 'Description for search engines (160 characters recommended)'
    }),
    defineField({
      name: 'seoKeywords',
      title: 'SEO關鍵字(metadata)',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Keywords for search engines'
    }),
    defineField({
      name: 'canonicalUrl',
      title: '標準網址(metadata)',
      type: 'url',
      description: 'Preferred URL for this page if duplicate content exists'
    }),
    defineField({
      name: 'noIndex',
      title: '禁止索引(metadata)',
      type: 'boolean',
      description: 'Prevent search engines from indexing this page',
      initialValue: false
    }),
    defineField({
      name: 'ogTitle',
      title: '社群分享標題(metadata)',
      type: 'string',
      description: 'Title for social media shares (defaults to SEO Title if empty)'
    }),
    defineField({
      name: 'ogDescription',
      title: '社群分享描述(metadata)',
      type: 'text',
      description: 'Description for social media shares (defaults to Meta Description if empty)'
    }),
    defineField({
      name: 'ogImage',
      title: '社群分享圖片(metadata)',
      type: 'image',
      options: {
        hotspot: true
      },
      fields: [
        defineField({
          name: 'alt',
          title: '替代文字(metadata)',
          type: 'string',
          description: 'Important for SEO and accessibility',
          validation: Rule => Rule.required()
        })
      ]
    })
  ]
})
