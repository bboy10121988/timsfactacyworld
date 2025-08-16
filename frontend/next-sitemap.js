const excludedPaths = [
  "/checkout", 
  "/account/*", 
  "/admin/*", 
  "/api/*", 
  "/_next/*",
  "/login",
  "/register",
  "/404", 
  "/500"
]

// 從Sanity獲取動態路径的函數
async function fetchSanityPaths() {
  try {
    const client = require('./src/lib/sanity/client').default
    const groq = require('groq')
    
    // 獲取所有页面，包含SEO設定
    const pages = await client.fetch(groq`
      *[_type in ["homePage", "pages", "post"] && !(_id in path("drafts.**"))] {
        _type,
        _updatedAt,
        slug,
        publishedAt,
        status,
        seo {
          noIndex,
          priority,
          changeFrequency
        }
      }
    `)

    return pages
      .filter(page => {
        // 過濾掉草稿狀態的文章
        if (page._type === 'post' && page.status === 'draft') return false
        // 過濾掉設定為 noIndex 的页面
        if (page.seo?.noIndex) return false
        return true
      })
      .map(page => {
        let path
        if (page._type === 'homePage') {
          path = '/'
        } else if (page._type === 'post') {
          path = `/blog/${page.slug.current}`
        } else {
          path = `/${page.slug.current}`
        }

        return {
          path,
          lastModified: page._updatedAt || page.publishedAt || new Date().toISOString(),
          priority: page.seo?.priority || (path === '/' ? 1.0 : 0.8),
          changeFreq: page.seo?.changeFrequency || 'weekly',
          noIndex: false // 已經在上面過濾掉了
        }
      })
  } catch (error) {
    console.error('獲取Sanity路径失败:', error)
    return []
  }
}

module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  generateRobotsTxt: true,
  generateIndexSitemap: true, // 生成索引sitemap
  exclude: [...excludedPaths, "/sitemap*.xml"],
  
  // 添加 Medusa 產品和分類路徑
  additionalPaths: async (config) => {
    const sanityPaths = await fetchSanityPaths()
    
    // TODO: 添加 Medusa 產品路徑
    // const medusaPaths = await fetchMedusaProducts()
    
    return sanityPaths.map(item => ({
      loc: item.path,
      changefreq: item.changeFreq,
      priority: item.priority,
      lastmod: item.lastModified
    }))
  },

  transform: async (config, path) => {
    // 檢查動態路徑的設定
    const sanityPaths = await fetchSanityPaths()
    const matchedPath = sanityPaths.find(p => p.path === path)
    
    // 根據路徑類型設定不同的優先級和更新頻率
    let priority = 0.5
    let changefreq = 'monthly'
    
    if (path === '/') {
      priority = 1.0
      changefreq = 'daily'
    } else if (path.startsWith('/blog/')) {
      priority = 0.7
      changefreq = 'weekly'
    } else if (path.startsWith('/products/')) {
      priority = 0.8
      changefreq = 'weekly'
    } else if (path.startsWith('/collections/')) {
      priority = 0.6
      changefreq = 'weekly'
    }
    
    // 如果有 Sanity 設定則使用
    if (matchedPath) {
      priority = matchedPath.priority
      changefreq = matchedPath.changeFreq
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: matchedPath?.lastModified || new Date().toISOString(),
    }
  },

  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: "*",
        disallow: [...excludedPaths],
      },
      // 針對 Google 的特殊設定
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [...excludedPaths, "/search*"], // 防止索引搜索結果頁
      },
      // 控制抓取頻率
      {
        userAgent: "*",
        crawlDelay: 1,
      }
    ],
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/sitemap.xml`,
      // 如果有大量產品，可以分別生成產品sitemap
      // `${process.env.NEXT_PUBLIC_SITE_URL}/product-sitemap.xml`,
    ],
  },
}