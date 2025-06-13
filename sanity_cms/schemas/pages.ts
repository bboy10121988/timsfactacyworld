export default {
  name: 'pages',
  title: '動態頁面',
  type: 'document',
  icon: () => '📄',
  fields: [
    {
      name: 'title',
      title: '頁面標題',
      type: 'string',
      description: '顯示在頁面內容區域的標題，瀏覽器分頁標題將使用SEO設定中的預設網站標題',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: '頁面路徑',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'isActive',
      title: '啟用狀態',
      type: 'boolean',
      initialValue: true,
    },
    {
      name: 'seo',
      title: 'SEO 設定',
      type: 'object',
      options: {
        collapsible: true,
        collapsed: false,
      },
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta 標題',
          type: 'string',
          description: '此頁面特定的標題，將覆蓋網站設定中的預設網站標題，顯示在瀏覽器分頁和搜尋結果中',
        },
        {
          name: 'metaDescription',
          title: 'Meta 描述',
          type: 'text',
          rows: 3,
          description: '頁面的 meta description，用於 SEO',
        },
        {
          name: 'canonicalUrl',
          title: 'Canonical URL',
          type: 'url',
          description: '頁面的標準 URL',
        },
      ],
    },
    {
      name: 'mainSections',
      title: '頁面區塊',
      type: 'array',
      of: [
        { type: 'mainBanner' },
        { type: 'imageTextBlock' },
        { type: 'featuredProducts' },
        { type: 'blogSection' },
        { type: 'youtubeSection' },
        { type: 'contentSection' },
        { type: 'serviceCardSection' },
      ],
      validation: (Rule) => Rule.min(1).error('至少需要一個頁面區塊'),
    },
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug.current',
      isActive: 'isActive',
    },
    prepare(selection) {
      const { title, slug, isActive } = selection
      return {
        title: title || '未命名頁面',
        subtitle: `/${slug || 'no-slug'} ${isActive ? '✅' : '❌'}`,
      }
    },
  },
}
