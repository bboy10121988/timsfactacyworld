export default {
  name: 'homePage',
  title: '首頁',
  type: 'document',
  icon: () => '🏠',
  fields: [
    {
      name: 'title',
      title: '頁面標題',
      type: 'string',
      description: '用於 SEO 和管理目的的標題',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'seo',
      title: '🔍 SEO 優化設定',
      type: 'seoMeta',
      description: '首頁的搜尋引擎優化與社群媒體分享設定',
      options: {
        collapsible: true,
        collapsed: false,
      }
    },
    {
      name: 'mainSections',
      title: '📄 頁面內容區塊',
      type: 'array',
      of: [
        {type: 'mainBanner'},
        {type: 'imageTextBlock'},
        {type: 'featuredProducts'},
        {type: 'blogSection'},
        {type: 'youtubeSection'},
        {type: 'contentSection'},
        {type: 'serviceCardSection'},
      ],
      options: {
        sortable: true
      },
      validation: (Rule: any) => Rule.min(1).warning('建議至少添加一個內容區塊')
    }
  ],
  preview: {
    select: {
      title: 'title',
      seoTitle: 'seo.seoTitle'
    },
    prepare({title, seoTitle}: {title?: string, seoTitle?: string}) {
      return {
        title: title || '首頁',
        subtitle: seoTitle ? `SEO: ${seoTitle}` : '尚未設定 SEO 標題'
      }
    }
  }
}
