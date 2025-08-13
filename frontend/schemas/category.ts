export default {
  name: 'category',
  title: '分類',
  type: 'document',
  icon: () => '📂',
  fields: [
    { 
      name: 'title', 
      title: '分類名稱', 
      type: 'string',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'slug',
      title: '網址路徑',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    { 
      name: 'description', 
      title: '分類描述', 
      type: 'text',
      rows: 3
    },
    {
      name: 'seo',
      title: 'SEO 設定',
      type: 'seoMeta',
      description: '分類頁面的搜尋引擎優化設定'
    },
    {
      name: 'isActive',
      title: '啟用狀態',
      type: 'boolean',
      initialValue: true,
    }
  ],
  preview: {
    select: {
      title: 'title',
      description: 'description',
      slug: 'slug.current',
      isActive: 'isActive'
    },
    prepare(selection: any) {
      const { title, description, slug, isActive } = selection
      return {
        title: title || '未命名分類',
        subtitle: `/${slug || 'no-slug'} ${isActive ? '✅' : '❌'}`,
        description: description
      }
    }
  }
}