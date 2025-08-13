export default {
  name: 'collectionPage',
  title: '商品系列頁面 SEO',
  type: 'document',
  icon: () => '📦',
  description: '為特定商品系列頁面設定獨立的 SEO 優化',
  fields: [
    {
      name: 'collectionHandle',
      title: '系列代碼',
      type: 'string',
      description: '對應 Medusa 商品系列的 handle，用於匹配特定系列',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'collectionTitle',
      title: '系列名稱參考',
      type: 'string',
      description: '僅供參考，實際系列名稱來自 Medusa',
      readOnly: true
    },
    {
      name: 'seo',
      title: 'SEO 設定',
      type: 'seoMeta',
      description: '此商品系列頁面的搜尋引擎優化設定'
    },
    {
      name: 'isActive',
      title: '啟用自訂 SEO',
      type: 'boolean',
      description: '啟用後將使用此設定覆蓋預設的系列 SEO',
      initialValue: true,
    }
  ],
  preview: {
    select: {
      collectionHandle: 'collectionHandle',
      collectionTitle: 'collectionTitle',
      seoTitle: 'seo.seoTitle',
      isActive: 'isActive'
    },
    prepare(selection: any) {
      const { collectionHandle, collectionTitle, seoTitle, isActive } = selection
      return {
        title: collectionTitle || collectionHandle || '未指定系列',
        subtitle: `SEO: ${seoTitle || '未設定'} ${isActive ? '✅' : '❌'}`,
        description: `系列代碼: ${collectionHandle || '未設定'}`
      }
    }
  }
}
