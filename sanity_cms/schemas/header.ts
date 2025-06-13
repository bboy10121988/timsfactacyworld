export default {
  name: 'header',
  title: '網站設定',
  type: 'document',
  liveEdit: false,
  __experimental_actions: ['update', 'publish'], // 只允許編輯和發布，不允許創建或刪除
  description: '網站基本設定和SEO配置，重要：所有頁面的網頁標題(瀏覽器分頁標題)必須使用SEO設定中的預設網站標題，不可使用商店名稱。前端開發者注意：頁面和後台編輯畫面的標題也應顯示SEO設定的預設網站標題，而非商店名稱',
  // 這個函數會在網站設定文檔被顯示時，將其標題修改為 SEO 設定中的預設網站標題
  // 若無法取得 SEO 標題則使用預設的 '網站設定'
  preview: {
    select: {
      metaTitle: 'seoSettings.metaTitle',
      storeName: 'storeName',
    },
    prepare(selection: {metaTitle?: string, storeName?: string}) {
      const {metaTitle, storeName} = selection
      return {
        title: metaTitle || '網站設定 (請設定SEO預設網站標題)',
        subtitle: `提醒：頁面標題應使用SEO設定中的預設網站標題 (目前商店名稱：${storeName || '未設定'})`,
      }
    },
  },
  fieldsets: [
    {
      name: 'basic',
      title: '基本設定',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'seo',
      title: 'SEO 設定',
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    {
      name: 'marquee',
      title: '頁首跑馬燈',
      type: 'object',
      fieldset: 'basic',
      description: '顯示在網站頂部的跑馬燈通知。支援1-3行文字，每行文字停留3秒。系統會根據開啟的行數自動調整動畫：1行=靜止顯示，2行=循環滾動，3行=循環滾動',
      fields: [
        {
          name: 'enabled',
          title: '啟用跑馬燈',
          type: 'boolean',
          initialValue: false,
          description: '開啟後可設定跑馬燈文字。支援的顯示模式：\n• 僅開啟行1 = 靜止顯示行1\n• 開啟行1+行2 = 循環滾動：行1 → 行2 → 行1\n• 開啟行1+行2+行3 = 循環滾動：行1 → 行2 → 行3 → 行1\n• 每行文字停留時間固定為3秒'
        },
        {
          name: 'text1',
          title: '跑馬燈文字 1',
          type: 'object',
          description: '第一段跑馬燈文字設定',
          fields: [
            {
              name: 'enabled',
              title: '顯示此段文字',
              type: 'boolean',
              initialValue: true,
              description: '開啟以顯示此段跑馬燈文字'
            },
            {
              name: 'content',
              title: '文字內容',
              type: 'string',
              description: '跑馬燈顯示的文字內容',
              validation: (Rule: any) => Rule.max(50).error('跑馬燈文字不可超過 50 個字元'),
              hidden: ({parent}: any) => !parent?.enabled
            }
          ]
        },
        {
          name: 'text2',
          title: '跑馬燈文字 2',
          type: 'object',
          description: '第二段跑馬燈文字設定（選填）',
          fields: [
            {
              name: 'enabled',
              title: '顯示此段文字',
              type: 'boolean',
              initialValue: false,
              description: '開啟以顯示此段跑馬燈文字'
            },
            {
              name: 'content',
              title: '文字內容',
              type: 'string',
              description: '跑馬燈顯示的文字內容',
              validation: (Rule: any) => Rule.max(50).error('跑馬燈文字不可超過 50 個字元'),
              hidden: ({parent}: any) => !parent?.enabled
            }
          ]
        },
        {
          name: 'text3',
          title: '跑馬燈文字 3',
          type: 'object',
          description: '第三段跑馬燈文字設定（選填）',
          fields: [
            {
              name: 'enabled',
              title: '顯示此段文字',
              type: 'boolean',
              initialValue: false,
              description: '開啟以顯示此段跑馬燈文字'
            },
            {
              name: 'content',
              title: '文字內容',
              type: 'string',
              description: '跑馬燈顯示的文字內容',
              validation: (Rule: any) => Rule.max(50).error('跑馬燈文字不可超過 50 個字元'),
              hidden: ({parent}: any) => !parent?.enabled
            }
          ]
        },
        {
          name: 'linkUrl',
          title: '連結網址',
          type: 'url',
          description: '點擊跑馬燈後的導向連結（選填）'
        },
        {
          name: 'pauseOnHover',
          title: '滑鼠懸停時暫停',
          type: 'boolean',
          description: '當滑鼠懸停在跑馬燈上時是否暫停滾動',
          initialValue: true
        }
      ]
    },
    {
      name: 'logo',
      title: '網站標誌',
      type: 'image',
      description: '建議尺寸 150x40 像素',
      fieldset: 'basic',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: '圖片說明',
          description: '為了無障礙和 SEO 請描述這張圖片',
          validation: (Rule: any) => Rule.required().error('圖片說明為必填項目')
        },
      ],
      validation: (Rule: any) => Rule.required().error('網站標誌為必填項目'),
    },
    {
      name: 'storeName',
      title: '商店名稱',
      type: 'string',
      description: '僅用於在沒有上傳標誌時，在導覽列顯示的替代文字，不影響網站頁面標題',
      fieldset: 'basic',
      validation: (Rule: any) => Rule.required().error('商店名稱為必填項目')
    },
    {
      name: 'navigation',
      title: '導覽選單',
      type: 'array',
      description: '頁首導覽列的連結',
      fieldset: 'basic',
      of: [
        {
          type: 'object',
          title: '選單項目',
          fields: [
            {
              name: 'name',
              title: '連結文字',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'href',
              title: '連結網址',
              type: 'string',
              description: '請直接提供完整網址(包含http/https)或站內路徑(以/開頭)',
              validation: (Rule: any) => Rule.required(),
            },
          ],
        },
      ],
    },

    // SEO 設定
    {
      name: 'seoSettings',
      title: 'SEO 基本設定',
      type: 'object',
      fieldset: 'seo',
      fields: [
        {
          name: 'metaTitle',
          title: '預設網站標題',
          type: 'string',
          description: '顯示在瀏覽器分頁和搜尋結果的標題，也是所有頁面的預設標題 (此設定可被其他頁面設定覆蓋)',
          validation: (Rule: any) => Rule.required().max(60),
        },
        {
          name: 'metaDescription',
          title: '預設網站描述',
          type: 'text',
          description: '顯示在搜尋結果的網站描述 (此設定可被其他頁面設定覆蓋)',
          validation: (Rule: any) => Rule.required().max(155),
        },
        {
          name: 'favicon',
          title: '網站圖示',
          type: 'image',
          description: '顯示在瀏覽器分頁的小圖示 (建議使用 32x32 像素的 .ico 或 .png)',
        },
        {
          name: 'canonicalUrl',
          title: '標準網址',
          type: 'url',
          description: '網站的主要網址，例如: https://www.example.com',
          validation: (Rule: any) => Rule.uri({scheme: ['http', 'https']}).error('請輸入有效的網址，需包含 http:// 或 https://')
        },
        {
          name: 'keywords',
          title: '關鍵字',
          type: 'array',
          of: [{ type: 'string' }],
          description: '網站的主要關鍵字（以逗號分隔）',
        },
      ],
    },
    {
      name: 'socialMedia',
      title: '社群媒體設定',
      type: 'object',
      fieldset: 'seo',
      description: '設定網站在社群媒體上分享時的顯示方式',
      fields: [
        {
          name: 'ogTitle',
          title: '社群標題',
          type: 'string',
          description: '在社群媒體上分享時顯示的標題（如未設定則使用預設網站標題）',
          validation: (Rule: any) => Rule.max(95).error('社群標題不可超過 95 個字元')
        },
        {
          name: 'ogDescription',
          title: '社群描述',
          type: 'text',
          description: '在社群媒體上分享時顯示的描述（如未設定則使用預設網站描述）',
          validation: (Rule: any) => Rule.max(200).error('社群描述不可超過 200 個字元')
        },
        {
          name: 'ogImage',
          title: '社群分享圖片',
          type: 'image',
          description: '當網站被分享時顯示的預設圖片 (建議尺寸 1200x630 像素，最小 600x315)',
          options: {
            hotspot: true
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: '圖片說明',
              description: '描述圖片內容，幫助搜尋引擎理解'
            }
          ],
          validation: (Rule: any) => Rule.required().error('社群分享圖片為必填項目')
        },
        {
          name: 'structuredData',
          title: '結構化資料',
          type: 'object',
          description: '幫助 Google 生成富結果和知識面板',
          fields: [
            {
              name: 'orgName',
              title: '組織名稱',
              type: 'string',
              description: '公司或品牌的正式名稱'
            },
            {
              name: 'orgLogo',
              title: '組織標誌',
              type: 'image',
              description: '正方形標誌，建議尺寸 512x512 像素'
            },
            {
              name: 'orgType',
              title: '組織類型',
              type: 'string',
              options: {
                list: [
                  {title: '公司', value: 'Corporation'},
                  {title: '組織', value: 'Organization'},
                  {title: '電子商務', value: 'OnlineStore'},
                  {title: '本地商家', value: 'LocalBusiness'}
                ]
              }
            }
          ]
        },
        {
          name: 'ogType',
          title: '內容類型',
          type: 'string',
          description: '指定網站的類型，影響社群媒體顯示方式和搜尋引擎理解',
          options: {
            list: [
              {title: '網站', value: 'website'},
              {title: '商品', value: 'product'},
              {title: '文章', value: 'article'},
              {title: '公司', value: 'business.business'}
            ]
          },
          initialValue: 'website',
          validation: (Rule: any) => Rule.required().error('請選擇內容類型')
        },
        {
          name: 'ogLocale',
          title: '語言地區',
          type: 'string',
          description: '網站的主要語言和地區設定，影響搜尋引擎對內容的地區關聯',
          options: {
            list: [
              {title: '繁體中文 (台灣)', value: 'zh_TW'},
              {title: '繁體中文 (香港)', value: 'zh_HK'},
              {title: '英文 (美國)', value: 'en_US'},
              {title: '日文 (日本)', value: 'ja_JP'}
            ]
          },
          initialValue: 'zh_TW'
        },
        {
          name: 'sitemapSettings',
          title: '網站地圖設定',
          type: 'object',
          description: '控制搜尋引擎如何索引您的網站',
          fields: [
            {
              name: 'sitemapUrl',
              title: '網站地圖網址',
              type: 'url',
              description: '您的 sitemap.xml 位置，例如: https://example.com/sitemap.xml'
            },
            {
              name: 'generateSitemap',
              title: '自動生成網站地圖',
              type: 'boolean',
              description: '是否自動生成 sitemap.xml 檔案',
              initialValue: true
            },
            {
              name: 'sitemapExclude',
              title: '排除的頁面',
              type: 'array',
              of: [{ type: 'string' }],
              description: '不想被收錄在網站地圖中的頁面路徑，例如: /admin, /login'
            },
            {
              name: 'sitemapPriority',
              title: '網頁優先級',
              type: 'object',
              description: '設定網站中不同類型頁面的優先級 (0.0-1.0)',
              fields: [
                {
                  name: 'home',
                  title: '首頁優先級',
                  type: 'number',
                  initialValue: 1.0,
                  validation: (Rule: any) => Rule.min(0).max(1)
                },
                {
                  name: 'category',
                  title: '分類頁優先級',
                  type: 'number',
                  initialValue: 0.8,
                  validation: (Rule: any) => Rule.min(0).max(1)
                },
                {
                  name: 'product',
                  title: '商品頁優先級',
                  type: 'number',
                  initialValue: 0.6,
                  validation: (Rule: any) => Rule.min(0).max(1)
                }
              ]
            },
            {
              name: 'robotsTxt',
              title: 'Robots.txt 內容',
              type: 'text',
              description: '自訂 robots.txt 內容，控制搜尋引擎爬蟲行為'
            }
          ]
        },
        {
          name: 'googleVerification',
          title: 'Google 站長驗證',
          type: 'string',
          description: 'Google Search Console 驗證用的 meta 標籤內容'
        }
      ]
    }
  ]
}
