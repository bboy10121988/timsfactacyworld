export default {
  name: 'contentSection',
  title: '一般內容區塊',
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
      name: 'subtitle',
      title: '副標題',
      type: 'string'
    },
    {
      name: 'content',
      title: '內容',
      type: 'array',
      of: [
        {
          type: 'block'
        }
      ]
    }
  ],
  preview: {
    select: {
      title: 'title'
    },
    prepare({title}) {
      return {
        title: title || '一般內容區塊'
      }
    }
  }
}
