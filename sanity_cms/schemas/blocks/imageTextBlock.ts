export default {
  name: 'imageTextBlock',
  title: '圖文區塊',
  type: 'object',
  fields: [
    {
      name: 'isActive',
      title: '是否啟用',
      type: 'boolean',
      initialValue: true
    },
    {
      name: 'heading',
      title: '標題',
      type: 'string'
    },
    {
      name: 'content',
      title: '內文',
      type: 'text',
      hidden: ({parent}: any) => parent?.layout === 'textLeftTextRight'
    },
    {
      name: 'layout',
      title: '版面配置',
      type: 'string',
      options: {
        list: [
          {title: '圖片在左', value: 'imageLeft'},
          {title: '圖片在右', value: 'imageRight'},
          {title: '左右圖片', value: 'imageLeftImageRight'},
          {title: '左右文字', value: 'textLeftTextRight'},
          {title: '置中文字', value: 'centerText'}
        ]
      }
    },
    {
      name: 'image',
      title: '圖片',
      type: 'image',
      options: {
        hotspot: true
      },
      hidden: ({parent}: any) => parent?.layout === 'textLeftTextRight' || parent?.layout === 'centerText' || parent?.layout === 'imageLeftImageRight'
    },
    {
      name: 'leftImage',
      title: '左側圖片',
      type: 'image',
      options: {
        hotspot: true
      },
      hidden: ({parent}: any) => parent?.layout !== 'imageLeftImageRight'
    },
    {
      name: 'rightImage',
      title: '右側圖片',
      type: 'image',
      options: {
        hotspot: true
      },
      hidden: ({parent}: any) => parent?.layout !== 'imageLeftImageRight'
    },
    {
      name: 'leftContent',
      title: '左側內文',
      type: 'text',
      rows: 4,
      hidden: ({parent}: any) => parent?.layout !== 'textLeftTextRight'
    },
    {
      name: 'rightContent',
      title: '右側內文',
      type: 'text',
      rows: 4,
      hidden: ({parent}: any) => parent?.layout !== 'textLeftTextRight'
    }
  ],
  preview: {
    select: {
      title: 'heading',
      media: 'image'
    },
    prepare({title, media}: any) {
      return {
        title: title || '圖文區塊',
        media
      }
    }
  }
}
