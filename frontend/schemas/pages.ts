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
      description: '顯示在頁面內容區域的標題',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: '頁面路徑',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'isActive',
      title: '啟用狀態',
      type: 'boolean',
      initialValue: true,
    },
    {
      name: 'seo',
      title: '🔍 SEO 優化設定',
      type: 'seoMeta',
      description: '此頁面的搜尋引擎優化與社群媒體分享設定',
      options: {
        collapsible: true,
        collapsed: false,
      },
    },
    {
      name: 'mainSections',
      title: '📄 頁面內容區塊',
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
      validation: (Rule: any) => Rule.min(1).error('至少需要一個頁面區塊'),
    },
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug.current',
      isActive: 'isActive',
      seoTitle: 'seo.seoTitle'
    },
    prepare(selection: any) {
      const { title, slug, isActive, seoTitle } = selection
      return {
        title: title || '未命名頁面',
        subtitle: `/${slug || 'no-slug'} ${isActive ? '✅' : '❌'}`,
        description: seoTitle ? `SEO: ${seoTitle}` : '尚未設定 SEO 標題'
      }
    },
  },
}
