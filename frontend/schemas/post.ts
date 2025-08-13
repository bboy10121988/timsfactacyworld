export default {
  name: 'post',
  title: '部落格文章',
  type: 'document',
  icon: () => '✍️',
  fields: [
    { 
      name: 'title', 
      title: '文章標題', 
      type: 'string',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'publishedAt',
      title: '發布日期',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    },
    {
      name: 'status',
      title: '發布狀態',
      type: 'string',
      options: {
        list: [
          { title: '草稿 📝', value: 'draft' },
          { title: '已發布 ✅', value: 'published' },
          { title: '已下架 ❌', value: 'archived' },
        ],
      },
      initialValue: 'draft',
    },
    {
      name: 'slug',
      title: '文章網址',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'seo',
      title: '🔍 SEO 優化設定',
      type: 'seoMeta',
      description: '此文章的搜尋引擎優化與社群媒體分享設定',
      options: {
        collapsible: true,
        collapsed: true,
      },
    },
    {
      name: 'author',
      title: '作者',
      type: 'reference',
      to: [{ type: 'author' }],
    },
    {
      name: 'mainImage',
      title: '文章封面',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          title: '圖片替代文字',
          type: 'string',
          description: '封面圖片的替代文字，用於無障礙和 SEO 優化',
          validation: (Rule: any) => Rule.required().error('封面圖片的替代文字為必填欄位')
        }
      ]
    },
    {
      name: 'categories',
      title: '文章分類',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'category' } }],
    },
    {
      name: 'body',
      title: '文章內容',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (Rule: any) => Rule.required()
    },
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      status: 'status',
      publishedAt: 'publishedAt',
      media: 'mainImage',
      seoTitle: 'seo.seoTitle'
    },
    prepare(selection: any) {
      const { title, author, status, publishedAt, media, seoTitle } = selection
      const statusEmoji = {
        draft: '📝',
        published: '✅',
        archived: '❌'
      }
      return {
        title: title || '未命名文章',
        subtitle: `${author || '未指定作者'} • ${statusEmoji[status as keyof typeof statusEmoji] || ''} ${status}`,
        description: seoTitle ? `SEO: ${seoTitle}` : '尚未設定 SEO 標題',
        media
      }
    }
  }
}
