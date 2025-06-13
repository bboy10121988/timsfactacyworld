import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'footer',
  title: 'Footer',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: '頁尾版本名稱',
      description: '為此頁尾版本命名，方便在有多個版本時進行識別和切換',
      type: 'string',
      validation: rule => rule.required().warning('請為頁尾版本提供一個名稱')
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'sections',
      title: '頁尾自訂模塊區域',
      description: '自訂的頁尾模塊區域，從左側第三欄開始（前兩欄為商品系列和商品分類，系統自動生成），最多可新增三個模塊（總共5欄）',
      type: 'array',
      validation: rule => rule.max(3).warning('頁尾最多只能新增三個自訂模塊（總共5欄）'),
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              type: 'string',
              title: '模塊標題'
            },
            {
              name: 'links',
              type: 'array',
              title: '連結列表',
              of: [
                {
                  type: 'object',
                  fields: [
                    { name: 'text', type: 'string', title: '連結文字' },
                    { name: 'url', type: 'url', title: '連結網址' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }),
    defineField({
      name: 'contactInfo',
      title: '聯絡資訊',
      description: '設定公司聯絡資訊',
      type: 'object',
      fields: [
        {
          name: 'phone',
          type: 'string',
          title: '電話號碼',
          description: '顯示在頁尾的電話號碼',
        },
        {
          name: 'email',
          type: 'string',
          title: '電子郵件',
          description: '顯示在頁尾的電子郵件地址',
        }
      ]
    }),
    defineField({
      name: 'socialMedia',
      title: '社群媒體連結',
      description: '設定社群媒體的連結網址和是否顯示，圖標和平台名稱已預先設定好',
      type: 'object',
      fields: [
        {
          name: 'facebook',
          type: 'object',
          title: 'Facebook',
          fields: [
            {
              name: 'enabled',
              type: 'boolean',
              title: '啟用',
              initialValue: true
            },
            {
              name: 'url',
              type: 'url',
              title: '連結網址',
              description: '請輸入完整網址，例如：https://www.facebook.com/yourpage'
            }
          ],
          // 使用預定義圖示而非JSX
          preview: {
            select: {
              enabled: 'enabled',
              url: 'url'
            },
            prepare({enabled, url}) {
              return {
                title: 'Facebook',
                subtitle: enabled ? (url || '尚未設定網址') : '已停用',
                media: {
                  type: 'icon',
                  icon: () => '👤'
                }
              }
            }
          }
        },
        {
          name: 'instagram',
          type: 'object',
          title: 'Instagram',
          fields: [
            {
              name: 'enabled',
              type: 'boolean',
              title: '啟用',
              initialValue: true
            },
            {
              name: 'url',
              type: 'url',
              title: '連結網址',
              description: '請輸入完整網址，例如：https://www.instagram.com/youraccount'
            }
          ],
          preview: {
            select: {
              enabled: 'enabled',
              url: 'url'
            },
            prepare({enabled, url}) {
              return {
                title: 'Instagram',
                subtitle: enabled ? (url || '尚未設定網址') : '已停用',
                media: {
                  type: 'icon',
                  icon: () => '📸'
                }
              }
            }
          }
        },
        {
          name: 'line',
          type: 'object',
          title: 'Line',
          fields: [
            {
              name: 'enabled',
              type: 'boolean',
              title: '啟用',
              initialValue: true
            },
            {
              name: 'url',
              type: 'url',
              title: '連結網址',
              description: '請輸入完整網址，例如：https://line.me/ti/p/@yourid'
            }
          ],
          preview: {
            select: {
              enabled: 'enabled',
              url: 'url'
            },
            prepare({enabled, url}) {
              return {
                title: 'Line',
                subtitle: enabled ? (url || '尚未設定網址') : '已停用',
                media: {
                  type: 'icon',
                  icon: () => '💬'
                }
              }
            }
          }
        },
        {
          name: 'youtube',
          type: 'object',
          title: 'YouTube',
          fields: [
            {
              name: 'enabled',
              type: 'boolean',
              title: '啟用',
              initialValue: true
            },
            {
              name: 'url',
              type: 'url',
              title: '連結網址',
              description: '請輸入完整網址，例如：https://www.youtube.com/c/yourchannel'
            }
          ],
          preview: {
            select: {
              enabled: 'enabled',
              url: 'url'
            },
            prepare({enabled, url}) {
              return {
                title: 'YouTube',
                subtitle: enabled ? (url || '尚未設定網址') : '已停用',
                media: {
                  type: 'icon',
                  icon: () => '🎬'
                }
              }
            }
          }
        },
        {
          name: 'twitter',
          type: 'object',
          title: 'Twitter/X',
          fields: [
            {
              name: 'enabled',
              type: 'boolean',
              title: '啟用',
              initialValue: true
            },
            {
              name: 'url',
              type: 'url',
              title: '連結網址',
              description: '請輸入完整網址，例如：https://twitter.com/youraccount'
            }
          ],
          preview: {
            select: {
              enabled: 'enabled',
              url: 'url'
            },
            prepare({enabled, url}) {
              return {
                title: 'Twitter/X',
                subtitle: enabled ? (url || '尚未設定網址') : '已停用',
                media: {
                  type: 'icon',
                  icon: () => '❌'
                }
              }
            }
          }
        }
      ],
    }),
    defineField({
      name: 'copyright',
      title: '版權資訊',
      description: '顯示在頁尾底部的版權資訊，可使用 {year} 作為當前年份的變數',
      type: 'string',
      initialValue: '© {year} 公司名稱. All rights reserved.',
    }),
  ],
})
