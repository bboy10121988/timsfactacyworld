export default {
  name: 'blogSection',
  title: '部落格文章區塊',
  type: 'object',
  fields: [
    {
      name: 'isActive',
      title: '是否啟用',
      type: 'boolean',
      initialValue: true
    },
    {
      name: 'title',
      title: '標題',
      type: 'string'
    },
    {
      name: 'category',
      title: '文章分類',
      type: 'reference',
      to: [{type: 'category'}]
    },
    {
      name: 'limit',
      title: '顯示數量',
      type: 'number',
      initialValue: 3,
      validation: Rule => Rule.required().min(1).max(12)
    }
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category.title'
    },
    prepare({title, category}) {
      return {
        title: title || '部落格文章區塊',
        subtitle: category ? `分類: ${category}` : ''
      }
    }
  }
}
