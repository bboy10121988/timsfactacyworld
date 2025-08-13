export default {
  name: 'productPage',
  title: '商品頁面 SEO',
  type: 'document',
  icon: () => '🛍️',
  description: '為特定商品頁面設定獨立的 SEO 優化',
  fields: [
    {
      name: 'productHandle',
      title: '商品代碼',
      type: 'string',
      description: '對應 Medusa 商品的 handle，用於匹配特定商品',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'productTitle',
      title: '商品名稱參考',
      type: 'string',
      description: '僅供參考，實際商品名稱來自 Medusa',
      readOnly: true
    },
    {
      name: 'seo',
      title: 'SEO 設定',
      type: 'seoMeta',
      description: '此商品頁面的搜尋引擎優化設定'
    },
    {
      name: 'isActive',
      title: '啟用自訂 SEO',
      type: 'boolean',
      description: '啟用後將使用此設定覆蓋預設的商品 SEO',
      initialValue: true,
    }
  ],
  preview: {
    select: {
      productHandle: 'productHandle',
      productTitle: 'productTitle',
      seoTitle: 'seo.seoTitle',
      isActive: 'isActive'
    },
    prepare(selection: any) {
      const { productHandle, productTitle, seoTitle, isActive } = selection
      return {
        title: productTitle || productHandle || '未指定商品',
        subtitle: `SEO: ${seoTitle || '未設定'} ${isActive ? '✅' : '❌'}`,
        description: `商品代碼: ${productHandle || '未設定'}`
      }
    }
  }
}
